import React, { Component } from 'react'
import { AppContext, StdinContext, Color, render } from 'ink'
import App from './app'
import ChatConnector from './chat-connector'

class Index extends Component {
	constructor() {
		super()
		this.state = {}

		this.forceUpdateRoot = this.forceUpdateRoot.bind(this)
	}

	forceUpdateRoot() {
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
									<ChatConnector host={this.props.host} port={this.props.port}>
										{({ChatConnection, connectToServer, emitMessage, nickname, setNickname, stopReconnecting}) => {
											return <App
												onExit={exit}
												setRawMode={setRawMode}
												stdin={stdin}
												connectToServer={connectToServer}
												emitMessage={emitMessage}
												setNickname={setNickname}
												nickname={nickname}
												ChatConnection={ChatConnection}
												forceUpdateRoot={this.forceUpdateRoot}
												nickFlag={this.props.nickFlag}
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

const startClient = (host, port, nickFlag) => render(<Index host={host} port={port} nickFlag={nickFlag} />)

export default startClient
