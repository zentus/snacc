const net = require('net')
const duplexEmitter = require('duplex-emitter')
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
		}
	})

	const host = net.createServer()

	host.listen(PORT)

	host.once('listening', () => {
		console.log('Server listening on port', PORT)
	})

	host.on('connection', (stream) => {
		let User
		const peer = duplexEmitter(stream)

		stream.on('end', () => {
			if (!User) return false

			Server.userDisconnected(User)
			Server.broadcast('notification', {
				text: `${User.nickname} has disconnected!`,
				users: Server.state.users,
				type: 'userDisconnected'
			}, user => user.id !== User.id)
		})

		peer.on('user-connected', nickname => {
			const userExists = Server.findUserByNickname(nickname)

			if (userExists) {
				return peer.emit('notification', {
					text: `The nickname "${nickname}" is already in use`,
					type: 'nicknameTaken'
				})
			}

			User = Server.userConnected(peer, nickname)

			Server.broadcast('notification', {
				text: `${User.nickname} has connected!`,
				User: {
					id: User.id,
					nickname: User.nickname
				},
				users: Server.state.users.map(user => ({
					id: user.id,
					nickname: user.nickname
				})),
				type: 'userConnected'
			})
		})

		peer.on('message-to-server', message => {
			const { nickname, text } = message

			Server.state.users.forEach(user => {
				user.peer.emit('message-from-server', message)
			})
		})
	})
}
