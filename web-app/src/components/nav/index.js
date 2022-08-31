import { useState } from "react"
import Close from "../icons/Close"
import Hamburger from "../icons/Hamburger"

const UserListUser = ({user}) => {
    return (
        <div className="user-list-user">
            <div className="message-avatar" style={{margin: 0, marginRight: 10}}></div>
            <div>{user.nickname}</div>
        </div>
    )
}

const UserList = props => {
    return <div className="user-list">{props.chat.users.map(user => <UserListUser key={user.id} user={user}/>)}</div>
}


const MenuContent = ({chat}) => {
    return (
        <div className="menu-content">
            <UserList chat={chat}/>
        </div>
    )
}

const Nav = ({setMenuIsOpen, menuIsOpen, chat, isMobile}) => {
    
    const navStyleOpenMenu = {
        width: isMobile ? '100vw' : '20vw',
        background: '#161616',
        zIndex: 10,
        paddingLeft: isMobile ? '4vw' : 'unset'
    }

    const navStyleClosedMenu = {
        width: isMobile ? '20vw' : 'unset',
    }

    const menuIconStyleOpenMenu = {
        textAlign: 'left'
    }

    const handleMenuIconClick = () => {
        setMenuIsOpen(!menuIsOpen)
    }
    return (
        <nav style={menuIsOpen ? navStyleOpenMenu : navStyleClosedMenu}>
            <div className="menu-icon" onClick={handleMenuIconClick} style={menuIsOpen ? menuIconStyleOpenMenu : {}}>
                {menuIsOpen ? <Close/> : <Hamburger/>}
            </div>
            {menuIsOpen && <MenuContent chat={chat}/>}
        </nav>
    )
}

export default Nav