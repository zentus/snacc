const UserConnect = props => (
    <div className="user-connect">
        <input
            autoFocus
            type="text"
            value={props.nickname}
            onKeyUp={e => e.key === 'Enter' && props.handleConnect()}
            onChange={e => props.setNickname(e.target.value)}
            placeholder='Nickname'
        />
        <button onClick={props.handleConnect}>Connect</button>
    </div>
)

export default UserConnect