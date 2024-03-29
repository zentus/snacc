import { Component } from 'react'
import EventEmitter from 'events'
import io from 'socket.io-client'
import { validateNickname } from '../../utils'

class ChatConnector extends Component {
  constructor () {
    super()

    this.state = {
      nickname: null,
      Peer: null,
      Stream: null,
      Reconnector: null,
      stopReconnecting: null,
      ChatConnection: new EventEmitter()
    }

    this.connectToServer = this.connectToServer.bind(this)
    this.emitMessage = this.emitMessage.bind(this)
  }

  emitMessage (message) {
    this.state.Peer.emit('message-to-server', message)
  }

  connectToServer (nickname) {
    const ChatConnection = this.state.ChatConnection
    const nicknameIsValid = validateNickname(nickname)

    if (!nicknameIsValid) {
      return ChatConnection.emit('notification', {
        type: 'invalidNickname',
        text: `Nickname "${nickname}" is invalid`
      })
    }

    const host = this.props.options.host

    const Peer = io(host, {
      // rejectUnauthorized: Boolean(host.startsWith('https'))
    })

    this.setState({ nickname, Peer })

    Peer.on('connect', () => {
      Peer.emit('user-connect', nickname)
    })

    Peer.on('disconnect', () => {
      ChatConnection.emit('disconnect', nickname)
    })

    Peer.on('notification', message => {
      ChatConnection.emit('notification', message)
    })

    Peer.on('message-from-server', message => {
      ChatConnection.emit('message-from-server', message)
    })
  }

  render () {
    return this.props.children({
      ChatConnection: this.state.ChatConnection,
      connectToServer: this.connectToServer,
      nickname: this.state.nickname,
      emitMessage: this.emitMessage
    })
  }
}

export default ChatConnector
