// const Readline = require('readline')
// const StateMachine = require('maskin')
// const reconnect = require('reconnect')
// const chalk = require('chalk')
// const duplexEmitter = require('duplex-emitter')
// const Zingo = require('zingo')
// const pkg = require('../package.json')

// const runClient = async () => {
//   const cli = new Zingo({
//     package: pkg,
//     usage: '[options]',
//     options: [{
//       option: 'serve',
//       shorthand: 's',
//       description: 'Host server'
//     }, {
//       option: 'connect',
//       shorthand: 'c',
//       description: 'Connect to server'
//     }, {
//       option: 'host',
//       shorthand: 'hs',
//       description: 'Set host URL [use with --connect] (default: "http://localhost:4808")'
//     }, {
//       option: 'port',
//       shorthand: 'p',
//       description: 'Set port [use with --serve] (default: 4808)'
//     }, {
//       option: 'nick',
//       shorthand: 'n',
//       description: 'Set nickname'
//     }]
//   })

//   cli.start()

//   const Client = new StateMachine({
//     initialState: {
//       User: null
//     },
//     // afterUpdate: state => console.log('nextState', state),
//     setUser: User => Client.setState({ User }),
//     exit: (rl, message) => {
//       Readline.clearLine(process.stdout, 0)
//       Readline.cursorTo(process.stdout, 0)
//       if (message && message.text) console.log(message.text)
//       rl.close()
//     }
//   })

//   const hostOption = cli.getOption('host')
//   const nickOption = cli.getOption('nick')
//   const nickname = nickOption.input

//   const prefix = nickname => chalk.bold(`${nickname}: `)

//   const reconnector = reconnect(async (stream) => {
//     const rl = Readline.createInterface({
//       input: process.stdin,
//       output: process.stdout
//     })

//     const peer = duplexEmitter(stream)

//     rl.setPrompt(prefix(nickname), prefix(nickname).length)
//     rl.prompt()

//     peer.emit('user-connect', nickname)

//     peer.on('notification', message => {
//       if (message.type === 'userConnected' && message.user && message.user.nickname === nickname) {
//         return Client.setUser(message.user)
//       }

//       if (message.type === 'nicknameTaken') {
//         return Client.exit(rl, message)
//       }

//       Readline.clearLine(process.stdout)
//       Readline.cursorTo(process.stdout, 0)
//       rl.pause()
//       console.log(chalk.bold.green(message.text))
//       rl.resume()
//       rl.prompt(true)
//     })

//     peer.on('message-from-server', message => {
//       Readline.clearLine(process.stdout)
//       Readline.cursorTo(process.stdout, 0)
//       rl.pause()
//       console.log(prefix(message.nickname) + message.text)
//       rl.resume()
//       rl.prompt(true)
//     })

//     rl.on('close', () => {
//       reconnector.reconnect = false
//       stream.end()
//       process.exit()
//     })

//     rl.on('line', text => {
//       if (text.trim() === '/exit') {
//         return Client.exit(rl)
//       }

//       Readline.clearLine(process.stdout)
//       Readline.cursorTo(process.stdout, 0)

//       rl.pause()

//       if (text.trim() === '') {
//         console.log('Empty messages are not allowed')
//       } else {
//         peer.emit('message-to-server', {
//           nickname,
//           text
//         })
//       }

//       rl.resume()
//       rl.prompt(true)
//     })
//   }).connect(443, hostOption.input)
// }

// runClient()
