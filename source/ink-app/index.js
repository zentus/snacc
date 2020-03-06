import React, { Component } from 'react'
import { AppContext, StdinContext, Color, render } from 'ink'
import App from './app'
import ChatConnector from './chat-connector'
import axios from 'axios'
import https from 'https'

class Index extends Component {
  constructor () {
    super()

    this.state = {}

    this.forceUpdateRoot = this.forceUpdateRoot.bind(this)
  }

	componentWillUnmount () {
		process.exit()
	}

  forceUpdateRoot () {
    this.forceUpdate()
  }

  render () {
    return <>
      <AppContext.Consumer>
        {({ exit }) => {
          return (
            <StdinContext.Consumer>
              {({ isRawModeSupported, setRawMode, stdin }) =>
                isRawModeSupported ? (
                  <ChatConnector options={this.props.options}>
                    {({ ChatConnection, connectToServer, emitMessage, nickname, setNickname, stopReconnecting }) => {
                      return <App
                        options={this.props.options}
                        onExit={exit}
                        setRawMode={setRawMode}
                        stdin={stdin}
                        connectToServer={connectToServer}
                        emitMessage={emitMessage}
                        setNickname={setNickname}
                        nickname={nickname}
                        ChatConnection={ChatConnection}
                        forceUpdateRoot={this.forceUpdateRoot}
                        stopReconnecting={stopReconnecting}
                      />
                    }}
                  </ChatConnector>
                ) : (
                  <Color white>rawMode is not supported</Color>
                )
              }
            </StdinContext.Consumer>
          )
        }}
      </AppContext.Consumer>
    </>
  }
}

const getHostUrl = options => `https://${options.host}:${options.port}`

const startClient = async options => {
  const endpoint = `${getHostUrl(options)}/version`

  try {
    const response = await axios(endpoint, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: options.rejectUnauthorized
      })
    })

    const serverVersion = response.data
    const clientVersion = options.pkg.version
    const versionsMatch = serverVersion === clientVersion

    if (versionsMatch) {
      return render(<Index options={options} />)
    }

    console.log(`
            Version mismatch:
            Server uses snacc ${serverVersion}
            Client uses snacc ${clientVersion}
            Please use the same version on both server and client`)
  } catch (error) {
    const status = error.response ? `${error.response.status} ${error.response.statusText}` : 'No response'
    console.log(`Could not get server version (${endpoint}).\nStatus: ${status}`)
    process.exit(1)
  }
}

export default startClient
