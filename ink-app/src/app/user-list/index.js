import React, { Component } from 'react'
import { Box, Color } from 'ink'

const UserList = props => {
	return <Box flexDirection="column" alignItems="flex-start" justifyContent="flex-start" {...props}>
		{props.users.map(User => (
			<Box key={User.id}>
				<Color bold>@{User.nickname}</Color>
			</Box>
		))}
	</Box>
}

export default UserList
