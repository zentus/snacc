(async () => {
	const Client = new StateMachine({
		initialState: {
			User: null
		},
		// afterUpdate: state => console.log('nextState', state),
		setUser: User => Client.setState({ User }),
		exit: (rl, message) => {
			Readline.clearLine(process.stdout, 0)
			Readline.cursorTo(process.stdout, 0)
			if (message && message.text) console.log(chalk.bold.red(message.text))
			rl.close()
		}
	})

	const nickname = nickOption.input || await waitForNickname()
	const prefix = nickname => chalk.bold(`${nickname}: `)

	const reconnector = reconnect(async (stream) => {
		const rl = Readline.createInterface({
			input: process.stdin,
			output: process.stdout
		})

		const peer = duplexEmitter(stream)

		rl.setPrompt(prefix(nickname), prefix(nickname).length)
		rl.prompt()

		peer.emit('user-connected', nickname)

		peer.on('notification', message => {
			if (message.type === 'userConnected' && message.user && message.user.nickname === nickname) {
				return Client.setUser(message.user)
			}

			if (message.type === 'nicknameTaken') {
				return Client.exit(rl, message)
			}

			Readline.clearLine(process.stdout)
			Readline.cursorTo(process.stdout, 0)
			rl.pause()
			console.log(chalk.bold.green(message.text))
			rl.resume()
			rl.prompt(true)
		})

		peer.on('message-from-server', message => {
			Readline.clearLine(process.stdout)
			Readline.cursorTo(process.stdout, 0)
			rl.pause()
			console.log(prefix(message.nickname) + message.text)
			rl.resume()
			rl.prompt(true)
		})

		rl.on('close', () => {
			reconnector.reconnect = false
			stream.end()
			process.exit()
		})

		rl.on('line', text => {
			if (text.trim() === '/exit') {
				return Client.exit(rl)
			}

			Readline.clearLine(process.stdout)
			Readline.cursorTo(process.stdout, 0)

			rl.pause()

			if (text.trim() === '') {
				console.log('Empty messages are not allowed')
			} else {
				peer.emit('message-to-server', {
					nickname,
					text
				})
			}

			rl.resume()
			rl.prompt(true)
		})
	})
	.connect(PORT, HOST)
})()

return
