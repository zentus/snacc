import React, { Component } from 'react'
import { Form, Field } from 'react-final-form'
import { Box } from 'ink'
import uuid from 'uuid/v4'
import Input from './input'
import Messages from './messages'
import UserList from './user-list'
import debounce from 'debounce'
import notifier from 'node-notifier'

const onWindowSizeChange = callback => {
  process.stdout.on('resize', debounce(() => {
    callback()
  }, 250))
}

const toSafeSize = ({ width, height }) => ({ safeWidth: width - 1, safeHeight: height - 1 })

const getUserListWidth = users => {
  const longestNicknameUser = [...users].sort((a, b) => a.nickname.length > b.nickname.length ? -1 : 1)[0]

  return longestNicknameUser ? longestNicknameUser.nickname.length : 0
}

const getWindow = () => {
  const width = process.stdout.columns
  const height = process.stdout.rows
  const { safeWidth, safeHeight } = toSafeSize({ width, height })
  const maxRows = safeHeight - 2
  const maxColumns = safeWidth

  return {
    width,
    height,
    safeHeight,
    safeWidth,
    maxRows,
    maxColumns
  }
}

class App extends Component {
  constructor () {
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

  addMessage (messageText, nickname, options = {}) {
    this.setState({
      messageText: messageText,
      messages: [
        ...this.state.messages,
        {
          nickname: nickname,
					isSystem: Boolean(options.isSystem),
          id: uuid(),
          text: messageText,
          timestamp: (new Date()).toLocaleTimeString('sv-SE')
        }
      ].reverse()
        .slice(0, getWindow().maxRows)
        .reverse()
    })
  }

  handleFormSubmit (maxRows) {
    const { props, state, addMessage } = this
    const User = state.User
    const needReconnect = state.needReconnect
    const { connectToServer, emitMessage, nickname } = props

    return function (e) {
      if (!e.messageText) return
      if (e.messageText.startsWith('/nick ')) {
        if (User) return false
        const split = e.messageText.split(' ')
        const nickname = split[1]

        if (!nickname) return

        return connectToServer(nickname)
      }

      if (!nickname || needReconnect) {
        return addMessage('Type "/nick yourname" to connect to server', null, { isSystem: true })
      }

      emitMessage({
        text: e.messageText,
        User
      })
    }
  }

  handleFieldSubmit (form, handleSubmit) {
    return e => {
      setTimeout(form.reset)
      handleSubmit(e)
    }
  }

  componentDidMount () {
    const { ChatConnection } = this.props

    if (this.props.options.nick) {
      this.props.connectToServer(this.props.options.nick)
    }

    onWindowSizeChange(() => {
      this.setState({
        ...getWindow()
      })
    })

    ChatConnection.on('notification', message => {
      if (message.type === 'nicknameTaken') {
        this.addMessage(message.text, null, { isSystem: true })
        this.setState({
          connected: false,
          needReconnect: true
        })
        return
      }

      if (message.type === 'userConnected' && message.User && message.User.nickname === this.props.nickname) {
        this.addMessage(`Welcome ${message.User.nickname}!`, null, { isSystem: true })

        if (this.props.options.selfHosted) {
          this.addMessage(`You are hosting this server on https://${this.props.options.host}:${this.props.options.port}`, null, { isSystem: true })
        }

        this.setState({
          users: message.users,
          User: message.User,
          connected: true,
          needReconnect: false
        })
        return
      }

      if (message.type === 'userConnected') {
        this.setState({
          users: message.users
        })
      }

      if (message.type === 'userDisconnected') {
        this.setState({
          users: message.users
        })
      }
    })

    ChatConnection.on('message-from-server', message => {
      const allowNotifications = this.state.User.registered && message.User.registered

      if (allowNotifications && message.text.includes(`@${this.props.nickname}`)) {
        notifier.notify({
          title: `@${message.User.nickname} mentioned you`,
          message: message.text
        })
      }

      this.addMessage(message.text, message.User.nickname)
    })

    ChatConnection.on('disconnect', username => {
      this.addMessage('Got disconnected from the server', null, { isSystem: true })
      this.props.onExit()
    })
  }

  componentWillUnmount () {
    this.props.onExit()
  }

  render () {
    const { safeHeight, safeWidth, maxRows, users, messages } = this.state
    const userListWidth = getUserListWidth(users)
    const messagesWidth = this.state.maxColumns - userListWidth

    return <>
      <Box flexDirection="column" height={safeHeight} width={safeWidth} textWrap="truncate">
        <Box>
          <Messages messages={messages} maxRows={maxRows} height={maxRows} textWrap="truncate" width={messagesWidth} paddingRight={1}/>
          <UserList users={users} width={userListWidth}/>
        </Box>
        <Box marginTop={1}>
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
