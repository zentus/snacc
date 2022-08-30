import { Component } from 'react'
import io from 'socket.io-client'

const validateNickname = nickname => {
  nickname = String(nickname).trim()
  const validLength = nickname.length > 1 && nickname.length <= 16
  const validChars = nickname.match(/^[a-zA-Z0-9\-_]{2,16}$/g)
  const hasAlphabetical = nickname.match(/[a-zA-Z]/)

  return Boolean(nickname && validLength && validChars && hasAlphabetical)
}

class ChatConnector extends Component {
  constructor () {
    super()

    this.state = {
      users: [],
      User: {},
      connected: false,
      messages: [],
    }

    this.connectToServer = this.connectToServer.bind(this)
    this.emitMessage = this.emitMessage.bind(this)
  }

  emitMessage (text) {
    this.state.Peer.emit('message-to-server', {
      User: this.state.User,
      text
    })
  }

  connectToServer (nickname) {
    console.log('connect')
    const nicknameIsValid = validateNickname(nickname)

    if (!nicknameIsValid) {
      return console.log('notification', {
        type: 'invalidNickname',
        text: `Nickname "${nickname}" is invalid`
      })
    }

    const host = this.props.options.host

    console.log('host', host)

    const Peer = io(host)

    this.setState({ nickname, Peer })

    Peer.on('connect', () => {
      console.log('connected')
      console.log('emit: user-connect(nickname)')
      Peer.emit('user-connect', nickname)
    })

    Peer.on('disconnect', () => {
      console.log('disconnect', nickname)
    })

    Peer.on('notification', message => {
      console.log('notification', message)

      if (message.type === 'userConnected' && message.User && message.User.nickname === nickname) {
        console.log(`Welcome ${message.User.nickname}!`, null, { isSystem: true })

        this.setState({
          users: message.users,
          User: message.User,
          connected: true
        })
      }
    })

    Peer.on('message-from-server', message => {
      console.log('message-from-server', message)

      const finalMessage = {
        ...message,
        timestamp: Date.now()
      }

      this.setState(state => ({
        messages: [
          ...state.messages,
          finalMessage
        ]
      }))
    })
  }

  render () {
    const App = this.props.children.type

    const props = {
      connectToServer: this.connectToServer,
      emitMessage: this.emitMessage,
      chat: {
        users: this.state.users,
        User: this.state.User,
        connected: this.state.connected,
        messages: this.state.messages,
      }
    }

    return <App {...props}/>
  }
}

export default ChatConnector
