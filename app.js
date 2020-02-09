const net = require('net')
const duplexEmitter = require('./duplex-emitter')
const reconnect = require('reconnect')
const Readline = require('readline')
const uuidv4 = require('uuid/v4')
const pkg = require('./package.json')
const chalk = require('chalk')

const Zingo = require('../cli-shell/lib')
const StateMachine = require('../state-Machine/index.js')

const cli = new Zingo({
	package: pkg,
	options: [{
		option: 'serve',
		shorthand: 's'
	}, {
		option: 'connect',
		shorthand: 'c'
	}, {
		option: 'host',
		shorthand: 'hs'
	}, {
		option: 'port',
		shorthand: 'p'
	}, {
		option: 'nick',
		shorthand: 'n'
	}]
})

const waitForNickname = () => new Promise(resolve => {
	const rl = Readline.createInterface({
		input: process.stdin,
		output: process.stdout
	})

	rl.question('Nickname: ', nickname => {
		resolve(nickname)
		rl.close()
	})
})

const serveOption = cli.getOption('serve')
const connectOption = cli.getOption('connect')
const hostOption = cli.getOption('host')
const portOption = cli.getOption('port')
const nickOption = cli.getOption('nick')

const TYPE = (serveOption.passed && 'server') || (connectOption.passed && 'client')
const HOST = (connectOption.passed && hostOption.passed && hostOption.input) || 'localhost'
const PORT = (portOption.passed && portOption.input) || '5000'
const NICK = nickOption.passed && nickOption.input

if (!TYPE) return console.error('Pass either --serve or --connect flag')

if (TYPE === 'client') {
	const startClient = require('./ink-app/dist').default
	return startClient(HOST, PORT, NICK)
}

// Server
if (TYPE === 'server') {
	const Server = new StateMachine({
		initialState: {
			users: []
		},
		afterUpdate: (state, prevState) => {
			console.log('State was updated. Next state:\n', state)
		},
		userConnected: (peer, nickname) => {
			const User = Server.createUser(peer, nickname)

			Server.setState(state => ({
				users: [
					...state.users,
					User
				]
			}))

			return User
		},
		userDisconnected: User => {
			Server.setState(state => ({
				users: state.users.filter(user => user.id !== User.id)
			}))
		},
		createId: value => uuidv4(),
		createUser: (peer, nickname) => ({
			id: Server.createId(nickname),
			nickname,
			peer,
			status: null
		}),
		broadcast: (e, payload, usersFilter) => {
			Server.state.users
				.filter(usersFilter ? usersFilter : u => u)
				.forEach(User => {
					User.peer.emit(e, payload)
				})
		},
		findUserByNickname: nickname => {
			return Server.state.users.find(user => user.nickname === nickname)
		},
		getCleanUserList: users => users.map(user => ({
			id: user.id,
			nickname: user.nickname
		})).sort((a, b) => a.nickname > b.nickname ? -1 : 1),
		isJsonString: string => {
			try {
				const jsonParsed = JSON.parse(string)

				return Array.isArray(jsonParsed)
			} catch (err) {
				return false
			}
		},
		waitForInitialPackage: async socket => new Promise((resolve, reject) => {
			socket.on('data', packet => {
				packet = packet.trim()
				const isJson = Server.isJsonString(packet)
				// const [dataEvent, data] = packet
				resolve({packet, isJson})
			})
		})
	})


	const TCP = net.createServer()

	TCP.listen(PORT)

	TCP.once('listening', () => {
		console.log('Server listening on port', PORT)
	})

	TCP.on('connection', socket => {
		socket.setEncoding('utf-8')
		let User
		let peer = duplexEmitter(socket)

		peer.on('error', e => {
			socket.end()
		})

		socket.on('end', () => {
			if (!User) return false

			Server.userDisconnected(User)
			Server.broadcast('notification', {
				text: `${User.nickname} has disconnected!`,
				users: Server.getCleanUserList(Server.state.users),
				type: 'userDisconnected'
			}, user => user.id !== User.id)
		})

		peer.on('user-connect', nickname => {
			const userExists = Server.findUserByNickname(nickname)

			if (userExists) {
				peer.emit('notification', {
					text: `The nickname "${nickname}" is already in use`,
					type: 'nicknameTaken'
				})
				return socket.end()
			}

			User = Server.userConnected(peer, nickname)

			Server.broadcast('notification', {
				text: `${User.nickname} has connected!`,
				User: {
					id: User.id,
					nickname: User.nickname
				},
				users: Server.getCleanUserList(Server.state.users),
				type: 'userConnected'
			})
		})

		peer.on('message-to-server', message => {
			if (!User || User.id !== message.User.id || User.nickname !== message.User.nickname) {
				peer.emit('come-on-man')
				return socket.end()
			}

			Server.state.users.forEach(_user => {
				_user.peer.emit('message-from-server', message)
			})
		})
	// })
	})
}
