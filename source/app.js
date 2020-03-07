#!/usr/bin/env node
const path = require('path')
const uuidv4 = require('uuid/v4')
const pkg = require('../package.json')
const fs = require('fs')
const express = require('express')
const socketIO = require('socket.io')
const https = require('https')
const Zingo = require('zingo')
const StateMachine = require('maskin')

const rootPath = partialPath => path.resolve(__dirname, '..', partialPath)

const cli = new Zingo({
  package: pkg,
  usage: '[options]',
  options: [{
    option: 'serve',
    shorthand: 's',
    description: 'Start server'
  }, {
    option: 'connect',
    shorthand: 'c',
    description: 'Start client'
  }, {
    option: 'host',
    shorthand: 'hs',
    description: 'Set host (default: localhost)'
  }, {
    option: 'port',
    shorthand: 'p',
    description: 'Set port (default: 4808)'
  }, {
    option: 'nick',
    shorthand: 'n',
    description: 'Set nickname'
  }, {
    option: 'use-self-signed-cert',
    shorthand: 'ussc',
    description: 'Use dev self signed certificate (as server)'
  }, {
    option: 'allow-self-signed-cert',
    shorthand: 'assc',
    description: 'Allow self signed certificate (as client)'
  }]
})

cli.start()

const serveOption = cli.getOption('serve')
const connectOption = cli.getOption('connect')
const hostOption = cli.getOption('host')
const portOption = cli.getOption('port')
const nickOption = cli.getOption('nick')
const allowSelfSignedCertOption = cli.getOption('allow-self-signed-cert')
const useSelfSignedCertOption = cli.getOption('use-self-signed-cert')

const configDefault = {
  pkg,
  host: 'localhost',
  port: 4808,
  selfHosted: false,
  keyPath: useSelfSignedCertOption.passed ? rootPath('./dev-certificate/server.key') : rootPath('./certificate/server.key'),
  certPath: useSelfSignedCertOption.passed ? rootPath('./dev-certificate/server.cert') : rootPath('./certificate/server.cert')
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
  rejectUnauthorized: allowSelfSignedCertOption.passed ? false : envToBoolean(process.env.SNACC_REJECT_UNAUTHORIZED, true),
  nick: nickOption.passed && nickOption.input
}

const Snacc = {
  run: () => {
    if (!config.type) return console.error('Pass either --serve or --connect flag, or SNACC_HOST environment variable')

    if (config.type === 'client') {
      const startClient = require('../dist').default
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
            .filter(usersFilter || Boolean)
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
          const startClient = require('../dist').default
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
          const validUser = typeof User === 'object'
          const validId = User && message && message.User && User.id === message.User.id
          const validNickname = User && message && message.User && User.nickname === message.User.nickname

          if (!validUser || !validId || !validNickname) {
            socket.emit('come-on-man')
            return socket.disconnect(true)
          }

          Server.state.users.forEach(user => {
            user.socket.emit('message-from-server', message)
          })
        })
      })
    }
  }
}

Snacc.run()
