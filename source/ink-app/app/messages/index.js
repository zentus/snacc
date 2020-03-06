import React from 'react'
import { Box, Color } from 'ink'

const Messages = props => {
  const messages = [...props.messages]
  messages.length = props.maxRows

  // <Box><Color>Messages</Color></Box>
  return (
    <Box flexDirection="column" alignItems="flex-start" justifyContent="flex-start" {...props}>
      {messages.map(message => (
        <Box key={message.id} width="100%" textWrap="truncate">
          {message.nickname === 'system' ? (
            <Color yellow>{message.text}</Color>
          ) : (
            <Color white>[{message.timestamp}] {message.nickname}: {message.text}</Color>
          ) }
        </Box>
      ))}
    </Box>
  )
}

export default Messages
