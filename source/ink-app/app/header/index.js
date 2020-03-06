import React from 'react'
import { Box, Color } from 'ink'

const Header = props => {
  return <Box height={props.height} paddingBottom={1} paddingTop={1}>
    <Box width={props.messagesWidth}>
      <Color blue>#general</Color>
    </Box>
    <Box width={props.userListWidth}>
      <Color blue>Users</Color>
    </Box>
  </Box>
}

export default Header
