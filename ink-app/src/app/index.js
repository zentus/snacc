import React, { Component } from 'react'
import { Form, Field } from 'react-final-form'
import { AppContext, StdinContext, render, Box, Color } from 'ink'
import windowSize from 'window-size'
import uuid from 'uuid/v4'
import Header from './header'
import Input from './input'
import Messages from './messages'
import UserList from './user-list'
import config from './config'
import debounce from 'debounce'

// const Sizer = props => {
// 	if (Array.isArray(props.children) || !props.children.type) return props.children
//
// 	const { maxWindowWidth, maxWindowHeight, minWindowWidth, minWindowHeight, window } = props
// 	const isWithinBounds = [
// 		maxWindowWidth && maxWindowWidth >= window.safeWidth,
// 		maxWindowHeight && maxWindowHeight >= window.safeHeight,
// 		minWindowWidth && minWindowWidth < window.safeWidth,
// 		minWindowHeight && minWindowHeight < window.safeHeight
// 	].every(condition => condition !== false)
//
// 	return isWithinBounds ? props.children : <Box/>
// }

const onWindowSizeChange = callback => {
	process.stdout.on('resize', debounce(() => {
		callback()
	}, 250))
}

const toSafeSize = ({width, height}) => ({safeWidth: width - 1, safeHeight: height - 1})

const getUserListWidth = users => {
	const longestNicknameUser = users.sort((a, b) => a.nickname.length > b.nickname.length ? -1 : 1)[0]

	return longestNicknameUser ? longestNicknameUser.nickname.length : 0
}

const getWindow = () => {
	const width = process.stdout.columns
	const height = process.stdout.rows
	const {safeWidth, safeHeight} = toSafeSize({width, height})
	const maxRows = safeHeight - 1
	const maxColumns = safeWidth

	return {
		width,
		height,
		safeHeight,
		safeWidth,
		maxRows,
		maxColumns
		// userListWidth,
		// messagesWidth
	}
}

class App extends Component {
	constructor() {
		super()

		this.state = {
			connected: false,
			User: null,
			messageText: '',
			messages: [],
			users: [],
			...getWindow()
		}

		this.handleFieldSubmit = this.handleFieldSubmit.bind(this)
		this.handleFormSubmit = this.handleFormSubmit.bind(this)
		this.addMessage = this.addMessage.bind(this)
	}

	componentDidUpdate(prevProps, prevState) {
		// if (this.state.messages.length === prevState.messages.length) {
		// 	this.addMessage(`dimensions: ${JSON.stringify({
		// 		window: this.state.window,
		// 		userListWidth: this.state.userListWidth,
		// 		messagesWidth: this.state.messagesWidth
		// 	})}`, 'system')
		// }
		//
	}

	addMessage(messageText, nickname) {
		this.setState({
			messageText: messageText,
			messages: [
				...this.state.messages,
				{
					nickname,
					id: uuid(),
					text: messageText,
					timestamp: (new Date).toLocaleTimeString('sv-SE')
				}
			].reverse().slice(0, getWindow().maxRows).reverse()
		})
	}

	handleFormSubmit(maxRows) {
		const { props, state, addMessage } = this
		const { ChatConnection, connectToServer, emitMessage, nickname } = props

		return function (e) {
			if (!e.messageText) return
			if (e.messageText.startsWith('/nick ')) {
				const split = e.messageText.split(' ')
				const nickname = split[1]

				if (!nickname) return

				return connectToServer(nickname)
			}

			if (!nickname) {
				return addMessage('Type "/nick yourname" to set a nickname and start chatting', 'system')
			}

			emitMessage({
				text: e.messageText,
				nickname
			})
		}
	}

	handleFieldSubmit(form, handleSubmit) {
		return e => {
			setTimeout(form.reset)
			handleSubmit(e)
		}
	}

	updateUserList(nextUsers) {
		this.setState({
			users: nextUsers
		})
	}

	componentDidMount() {
		const { ChatConnection } = this.props

		if (this.props.nickFlag) {
			this.props.connectToServer(this.props.nickFlag)
		}

		onWindowSizeChange(() => {
			this.setState({
				...getWindow()
			})
			// this.props.forceUpdateRoot();
		})

		ChatConnection.on('notification', message => {
			if (message.type === 'userConnected' && message.User && message.User.nickname === this.props.nickname) {
				this.addMessage(`Welcome ${message.User.nickname}. Your ID is ${message.User.id}`, 'system')

				return this.setState({
					users: message.users,
					User: message.User,
					connected: true
				})
			}

			if (message.type === 'userConnected' && message.User && message.User.nickname !== this.props.nickname) {
				this.setState({
					users: message.users
				})
			}

			if (message.type === 'userDisconnected') {
				this.setState({
					users: message.users
				})
			}

			if (message.type === 'nicknameTaken') {
				return this.setState({
					connected: false
				})
			}

			this.addMessage(message.text, 'system')
		})

		ChatConnection.on('message-from-server', message => {
			this.addMessage(message.text, message.nickname)
		})
	}

	render() {
		const { safeHeight, safeWidth, maxRows, maxColumns, users, messages } = this.state
		const userListWidth = getUserListWidth(users)
		const messagesWidth = this.state.maxColumns - userListWidth

		const percentToRows = (total, percent) => parseInt((total / 100) * percent, 10)

		// {/*<Box><Color red>Connected: {this.state.connected ? 'Yes' : 'No'} {this.state.width} {this.state.height}</Color></Box>*/}
		// {/*<Header height={config.headerHeight} messagesWidth={messagesWidth} userListWidth={userListWidth} maxRows={maxRows}/>*/}
		return <>
			<Box flexDirection="column" height={safeHeight} width={safeWidth} textWrap="truncate">
				<Box>
					<Messages messages={messages} maxRows={maxRows} textWrap="truncate" width={messagesWidth} paddingRight={1}/>
					<UserList users={users} width={userListWidth}/>
				</Box>
				<Box>
					<Form onSubmit={this.handleFormSubmit()}>
						{({ form, handleSubmit }) => (
							<Box>
								<Field name="messageText">
									{({ input, meta }) => (
										<Box flexDirection="column">
											<Input {...input} showCursor placeholder={'Message'} onSubmit={this.handleFieldSubmit(form, handleSubmit)}/>
										</Box>
									)}
								</Field>
							</Box>
						)}
					</Form>
				</Box>
			</Box>
		</>
	}
}

export default App
