import { useState, useRef, useEffect } from 'react'

function App(props) {
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
      {!connected && <>
        <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder='Nickname'/>
        <button onClick={handleConnect}>Connect</button>
      </>}
      <div className="messages" ref={messagesRef}>
        <div className="message-before"/>
        {props.chat.messages.map(message => (
          <div className="message" key={message.timestamp + message.User.id}>
            <div>
              <div className="message-avatar"/>
            </div>
            <div className="message-content">
              <div className="message-content-nickname"><strong>{message.User.nickname}</strong> {new Date(message.timestamp).toLocaleTimeString()}</div>
              <div>{message.text}</div>
            </div>
          </div>
        ))}
      </div>
      {connected && (
        <div className="message-box">
          <div>
            <textarea value={message} onChange={e => !isSendingMessage && setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} onKeyUp={e => e.key === 'Enter' && setIsSendingMessage(false)}/>
          </div>
          <div className="button-container" onClick={() => handleSendMessage() || setIsSendingMessage(false)}>
            <div className="button"/>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
