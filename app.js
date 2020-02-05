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

if (!TYPE) return console.error('Pass either --serve or --connect flag')

if (TYPE === 'client') {
	(async () => {
		const Client = new StateMachine({
			initialState: {
				User: null
			},
			// afterUpdate: state => console.log('nextState', state),
			setUser: User => Client.setState({ User }),
			exit: (rl, message) => {
				Readline.clearLine(process.stdout, 0)
				Readline.cursorTo(process.stdout, 0)
				if (message && message.text) console.log(chalk.bold.red(message.text))
				rl.close()
			}
		})

		const nickname = nickOption.input || await waitForNickname()
		const prefix = nickname => chalk.bold(`${nickname}: `)

		const reconnector = reconnect(async (stream) => {
			const rl = Readline.createInterface({
				input: process.stdin,
				output: process.stdout
			})

			const peer = duplexEmitter(stream)

			rl.setPrompt(prefix(nickname), prefix(nickname).length)
			rl.prompt()

			peer.emit('user-connected', nickname)

			peer.on('notification', message => {
				if (message.type === 'userConnected' && message.user && message.user.nickname === nickname) {
					return Client.setUser(message.user)
				}

				if (message.type === 'nicknameTaken') {
					return Client.exit(rl, message)
				}

				Readline.clearLine(process.stdout)
				Readline.cursorTo(process.stdout, 0)
				rl.pause()
				console.log(chalk.bold.green(message.text))
				rl.resume()
				rl.prompt(true)
			})

			peer.on('message-from-server', message => {
				Readline.clearLine(process.stdout)
				Readline.cursorTo(process.stdout, 0)
				rl.pause()
				console.log(prefix(message.nickname) + message.text)
				rl.resume()
				rl.prompt(true)
			})

			rl.on('close', () => {
				reconnector.reconnect = false
				stream.end()
				process.exit()
			})

			rl.on('line', text => {
				if (text.trim() === '/exit') {
					return Client.exit(rl)
				}

				if (text.trim() === '') {
					Readline.clearLine(process.stdout, 0)
					Readline.cursorTo(process.stdout, 0)
					rl.pause()
					console.log('Empty messages are not allowed')
					rl.resume()
					rl.prompt(true)
					return
				}

				rl.pause()
				peer.emit('message-to-server', {
					nickname,
					text
				})
				rl.resume()
				rl.prompt()
			})
		})
		.connect(PORT, HOST)
	})()

	return
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
		// setUserStatus: User =>
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
				text: `${User.nickname} has disconnected!`
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
				user: {
					id: User.id,
					nickname: User.nickname
				},
				type: 'userConnected'
			})
		})

		peer.on('message-to-server', message => {
			const { nickname, text } = message
			// const command = findCommand(message)

			const usersToSendTo = Server.state.users.filter(user => user.nickname !== nickname)

			usersToSendTo.forEach(user => {
				user.peer.emit('message-from-server', message)
			})
		})
	})
}
