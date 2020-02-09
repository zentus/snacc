import React, { Component } from 'react'
import duplexEmitter from '../../../duplex-emitter'
import reconnect from 'reconnect'
import EventEmitter from 'events'

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
		const port = this.props.port
		const host = this.props.host
		const setState = this.setState.bind(this)

		const Reconnector = reconnect(Stream => {
			const Peer = duplexEmitter(Stream)

			const stopReconnecting = () => {
				Reconnector.reconnect = false
			}

			setState({ nickname, Peer, Stream, Reconnector, stopReconnecting })

			Peer.emit('user-connect', nickname)

			Peer.on('notification', message => {
				ChatConnection.emit('notification', message)
			})

			Peer.on('message-from-server', message => {
				ChatConnection.emit('message-from-server', message)
			})
		})
		.connect(port, host)
	}

	render() {
		return this.props.children({
			ChatConnection: this.state.ChatConnection,
			connectToServer: this.connectToServer,
			setNickname: this.setNickname,
			nickname: this.state.nickname,
			emitMessage: this.emitMessage,
			stopReconnecting: this.state.stopReconnecting
		})
	}
}

export default ChatConnector
