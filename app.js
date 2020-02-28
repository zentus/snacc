#!/usr/bin/env node
const path = require('path')
const net = require('net')
const duplexEmitter = require('./duplex-emitter')
const reconnect = require('reconnect')
const Readline = require('readline')
const uuidv4 = require('uuid/v4')
const pkg = require('./package.json')
const chalk = require('chalk')
const fs = require('fs')

const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const https = require('https')

const Zingo = require('zingo')
const StateMachine = require('maskin')
const startClient = require('./ink-app/dist').default

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

const configDefault = {
	host: 'localhost',
	port: 4808,
	selfHosted: false,
	keyPath: path.join(__dirname, './certificate/server.key'),
	certPath: path.join(__dirname, './certificate/server.cert')
}

const envToBoolean = (env, defaultValue) => {
	if (env === undefined) return defaultValue
	if (env === 'true') return true
	if (env === 'false') return false
	return Boolean(env)
}

const config = {
	...configDefault,
	type: (process.env.SNACC_HOST && 'server') || (serveOption.passed && 'server') || (connectOption.passed && 'client'),
	host: process.env.SNACC_HOST || (connectOption.passed && hostOption.passed && hostOption.input) || configDefault.host,
	port: process.env.SNACC_PORT || (portOption.passed && portOption.input) || configDefault.port,
	keyPath: (process.env.SNACC_KEY_PATH && path.join(process.cwd(), process.env.SNACC_KEY_PATH)) || configDefault.keyPath,
	certPath: (process.env.SNACC_CERT_PATH && path.join(process.cwd(), process.env.SNACC_CERT_PATH)) || configDefault.certPath,
	rejectUnauthorized: envToBoolean(process.env.SNACC_REJECT_UNAUTHORIZED, true),
	nick: nickOption.passed && nickOption.input
}

if (!config.type) return console.error('Pass either --serve or --connect flag, or SNACC_HOST environment variable')

if (config.type === 'client') {
	return startClient(config)
}

// Server
if (config.type === 'server') {
	const Server = new StateMachine({
		initialState: {
			users: []
		},
		userConnected: (socket, nickname) => {
			const User = Server.createUser(socket, nickname)

			Server.setState(state => ({
				users: Server.getSortedUserList([
					...state.users,
					User
				])
			}))

			return User
		},
		userDisconnected: User => {
			Server.setState(state => ({
				users: Server.getSortedUserList(state.users.filter(user => user.id !== User.id))
			}))
		},
		createId: value => uuidv4(),
		createUser: (socket, nickname) => ({
			id: Server.createId(nickname),
			nickname,
			socket,
			status: null
		}),
		broadcast: (e, payload, usersFilter) => {
			Server.state.users
				.filter(usersFilter ? usersFilter : Boolean)
				.forEach(User => {
					User.socket.emit(e, payload)
				})
		},
		findUserByNickname: nickname => Server.state.users.find(user => user.nickname === nickname),
		getSortedUserList: users => [...users].sort((a, b) => a.nickname > b.nickname ? -1 : 1),
		toClientSideUserList: users => users.map(user => ({
			nickname: user.nickname,
			id: user.id
		}))
	})

	const serverOptions = {
		key: fs.readFileSync(config.keyPath, 'utf8'),
		cert: fs.readFileSync(config.certPath, 'utf8'),
		rejectUnauthorized: config.rejectUnauthorized,
		transports: ['websocket']
	}

	const app = express()
	const server = https.createServer(serverOptions, app)

	app.get('/version', (req, res) => res.send(pkg.version))

	const io = socketIO(server)

	server.listen(config.port, () => {
		if (connectOption.passed) {
			startClient({
				...config,
				selfHosted: true
			})
		}
	})

	io.on('connection', socket => {
		let User

		socket.on('error', e => {
			socket.end()
		})

		socket.on('disconnect', () => {
			if (!User) return false

			Server.userDisconnected(User)
			Server.broadcast('notification', {
				text: `${User.nickname} has disconnected!`,
				users: Server.toClientSideUserList(Server.state.users),
				type: 'userDisconnected'
			}, user => user.id !== User.id)
		})

		socket.on('user-connect', nickname => {
			const userExists = Server.findUserByNickname(nickname)

			if (userExists) {
				socket.emit('notification', {
					text: `The nickname "${nickname}" is already in use`,
					type: 'nicknameTaken'
				})
				return socket.disconnect(true)
			}

			User = Server.userConnected(socket, nickname)

			Server.broadcast('notification', {
				text: `${User.nickname} has connected!`,
				User: {
					id: User.id,
					nickname: User.nickname
				},
				users: Server.toClientSideUserList(Server.state.users),
				type: 'userConnected'
			})
		})

		socket.on('message-to-server', message => {
			if (
				!User ||
				( User && (User.id !== message.User.id || User.nickname !== message.User.nickname) )
			) {
				socket.emit('come-on-man')
				return socket.disconnect(true)
			}

			Server.state.users.forEach(_user => {
				_user.socket.emit('message-from-server', message)
			})
		})
	})
}
