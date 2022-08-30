#!/usr/bin/env node
import uuidv4 from 'uuid/v4'
import pkg from '../package.json'
import express from 'express'
import socketIO from 'socket.io'
import http from 'http'
import Zingo from 'zingo'
import StateMachine from 'maskin'
import { validateNickname } from './utils'
import startClient from './ink-app'

const cli = new Zingo({
  package: pkg,
  usage: '[options]',
  options: [{
    option: 'serve',
    shorthand: 's',
    description: 'Host server'
  }, {
    option: 'connect',
    shorthand: 'c',
    description: 'Connect to server'
  }, {
    option: 'host',
    shorthand: 'hs',
    description: 'Set host URL [use with --connect] (default: "http://localhost:4808")'
  }, {
    option: 'port',
    shorthand: 'p',
    description: 'Set port [use with --serve] (default: 4808)'
  }, {
    option: 'nick',
    shorthand: 'n',
    description: 'Set nickname'
  }]
})

cli.start()

const serveOption = cli.getOption('serve')
const connectOption = cli.getOption('connect')
const hostOption = cli.getOption('host')
const portOption = cli.getOption('port')
const nickOption = cli.getOption('nick')

const configDefault = {
  pkg,
  host: 'http://localhost:4808',
  port: 4808,
  selfHosted: false
}

const config = {
  ...configDefault,
  type: ((process.env.SNACC_HOST || serveOption.passed) && 'server') || (connectOption.passed && 'client'),
  host: process.env.SNACC_HOST || (connectOption.passed && hostOption.passed && hostOption.input) || configDefault.host,
  port: process.env.SNACC_PORT || (portOption.passed && portOption.input) || configDefault.port,
  nick: nickOption.passed && nickOption.input
}

const Snacc = {
  run: () => {
    if (!config.type) {
      console.error('Pass either --serve or --connect flag')
      return process.exit(1)
    }

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

      const app = express()
      const server = http.createServer({
        transports: ['websocket']
      }, app)

      app.get('/', (req, res) => res.sendStatus(200))
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
        console.log('connection', Server.state.users)
        let User

        socket.on('error', e => {
          socket.end()
        })

        socket.on('disconnect', () => {
          if (!User) return false

          Server.userDisconnected(User)
          Server.broadcast('notification', {
            text: `${User.nickname} disconnected!`,
            users: Server.toClientSideUserList(Server.state.users),
            type: 'userDisconnected'
          }, user => user.id !== User.id)
        })

        socket.on('user-connect', nickname => {
          const userExists = Server.findUserByNickname(nickname)
          const nicknameIsValid = validateNickname(nickname)

          if (userExists || !nicknameIsValid) {
            const reason = userExists ? 'already in use' : 'invalid'

            socket.emit('notification', {
              text: `The nickname "${nickname}" is ${reason}`,
              type: 'nicknameTaken'
            })
            return socket.disconnect(true)
          }

          User = Server.userConnected(socket, nickname)

          Server.broadcast('notification', {
            text: `${User.nickname} connected!`,
            User: {
              id: User.id,
              nickname: User.nickname
            },
            users: Server.toClientSideUserList(Server.state.users),
            type: 'userConnected'
          })
        })

        socket.on('message-to-server', message => {
          console.log('message-to-server', { message })
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
