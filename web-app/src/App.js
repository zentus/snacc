import { useState, useRef, useEffect } from 'react'
import MessageBox from './components/message-box'
import Messages from './components/messages'
import UserConnect from './components/user-connect'

const App = props => {
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')
  const [connected, setConnected] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  const messagesRef = useRef()

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight)
  }, [props.chat.messages])
  
  
  console.log('App render', {props})
  
  const handleConnect = () => {
    props.connectToServer(nickname)

    setConnected(true)
  }

  const handleSendMessage = () => {
    setIsSendingMessage(true)
    if (message.trim()) props.emitMessage(message.trim())
    setMessage('')
  }

  return (
    <div className="App">
      {!connected && <UserConnect
        nickname={nickname}
        setNickname={setNickname}
        handleConnect={handleConnect}
      />}
      {connected && (
        <>
          <Messages
            messages={props.chat.messages}
            messagesRef={messagesRef}
          />
          <MessageBox 
            message={message}
            isSendingMessage={isSendingMessage}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            setIsSendingMessage={setIsSendingMessage}
          />
        </>
      )}
    </div>
  );
}

export default App;
