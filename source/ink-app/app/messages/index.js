import React from 'react'
import { Box, Color } from 'ink'


const Message = props => {
	const colorProps = props.isSystem ? {
		yellow: true
	} : {
		white: true
	}

	const nickString = props.isSystem ? '' : `${props.nickname}: `

	return <Color {...colorProps}>[{props.timestamp}] {nickString}{props.text}</Color>
}

const Messages = props => {
  const messages = [...props.messages]
  messages.length = props.maxRows

  return (
    <Box flexDirection="column" alignItems="flex-start" justifyContent="flex-start" {...props}>
      {messages.map(message => (
        <Box key={message.id} width="100%" textWrap="truncate">
          <Message {...message}/>
        </Box>
      ))}
    </Box>
  )
}

export default Messages
