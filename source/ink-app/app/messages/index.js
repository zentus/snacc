import React from 'react'
import { Box, Color } from 'ink'
import Message from '../message'

const Messages = props => {
  const messages = [...props.messages]
  messages.length = props.maxRows

  return (
    <Box flexDirection="column" alignItems="flex-start" justifyContent="flex-start" {...props}>
      {messages.map(message => <Message key={message.id} {...message}/>)}
    </Box>
  )
}

export default Messages
