import React from 'react'
import { Box, Color } from 'ink'

const Message = props => {
  const colorProps = props.isSystem ? {
    yellow: true
  } : {
    white: true
  }

  const nickString = props.isSystem ? '' : `${props.nickname}: `

  return (
    <Box key={props.key} width={'100%'} textWrap={'truncate'}>
      <Color {...colorProps}>[{props.timestamp}] {nickString}{props.text}</Color>
    </Box>
  )
}

export default Message
