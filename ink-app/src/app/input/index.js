import React from 'react'
import InkTextInput from 'ink-text-input'

const Input = ({ onBlur, onFocus, ...props }) => {
	React.useEffect(() => {
		onFocus()
		return onBlur
	}, [onFocus, onBlur])

	return <InkTextInput {...props} showCursor />
}

export default Input
