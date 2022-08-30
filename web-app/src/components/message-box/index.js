const MessageBox = props => (
  <div className="message-box">
    <div>
      <textarea
        autoFocus
        value={props.message}
        onChange={e => !props.isSendingMessage && props.setMessage(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && props.handleSendMessage()}
        onKeyUp={e => e.key === 'Enter' && props.setIsSendingMessage(false)}
      />
    </div>
    <div className="button-container" onClick={() => props.handleSendMessage() || props.setIsSendingMessage(false)}>
      <div className="button"/>
    </div>
  </div>
)

export default MessageBox