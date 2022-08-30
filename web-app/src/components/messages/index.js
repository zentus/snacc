const Messages = props => (
    <div className="messages" ref={props.messagesRef}>
        <div className="message-before"/>
        {props.messages.map(message => (
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
)

export default Messages