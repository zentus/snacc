import React, { Component } from 'react'
import duplexEmitter from '../../../duplex-emitter'
import reconnect from 'reconnect'
import EventEmitter from 'events'
import io from 'socket.io-client'

class ChatConnector extends Component {
	constructor() {
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

	emitMessage(message) {
		this.state.Peer.emit('message-to-server', message)
	}

	connectToServer(nickname) {
		const ChatConnection = this.state.ChatConnection
		const port = this.props.options.port
		const host = this.props.options.host

		const Peer = io(`https://${host}:${port}`, {
			rejectUnauthorized: false
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

	render() {
		return this.props.children({
			ChatConnection: this.state.ChatConnection,
			connectToServer: this.connectToServer,
			setNickname: this.setNickname,
			nickname: this.state.nickname,
			emitMessage: this.emitMessage,
			stopReconnecting: () => {}
		})
	}
}

export default ChatConnector
