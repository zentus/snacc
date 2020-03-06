import React from 'react'
import { Box, Color } from 'ink'

const ui = {
  color: {
    guest: 'yellow',
    registered: 'green'
  }
}

const colorToObject = string => ({
  [string]: true
})

const getUserColor = User => {
  return User.registered ? colorToObject(ui.color.registered) : colorToObject(ui.color.guest)
}

const UserList = props => {
  return <Box flexDirection="column" alignItems="flex-start" justifyContent="flex-start" {...props}>
    {props.users.map(User => (
      <Box key={User.id} hex>
        <Color bold {...getUserColor(User)}>{User.registered ? '@' : ''}{User.nickname}</Color>
      </Box>
    ))}
  </Box>
}

export default UserList
