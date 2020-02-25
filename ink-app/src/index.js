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
									<ChatConnector options={this.props.options}>
										{({ChatConnection, connectToServer, emitMessage, nickname, setNickname, stopReconnecting}) => {
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

const startClient = (options) => render(<Index options={options} />)

export default startClient
