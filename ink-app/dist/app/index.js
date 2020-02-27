"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactFinalForm = require("react-final-form");

var _ink = require("ink");

var _windowSize = _interopRequireDefault(require("window-size"));

var _v = _interopRequireDefault(require("uuid/v4"));

var _header = _interopRequireDefault(require("./header"));

var _input = _interopRequireDefault(require("./input"));

var _messages = _interopRequireDefault(require("./messages"));

var _userList = _interopRequireDefault(require("./user-list"));

var _config = _interopRequireDefault(require("./config"));

var _debounce = _interopRequireDefault(require("debounce"));

var _nodeNotifier = _interopRequireDefault(require("node-notifier"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const onWindowSizeChange = callback => {
  process.stdout.on('resize', (0, _debounce.default)(() => {
    callback();
  }, 250));
};

const toSafeSize = ({
  width,
  height
}) => ({
  safeWidth: width - 1,
  safeHeight: height - 1
});

const getUserListWidth = users => {
  const longestNicknameUser = [...users].sort((a, b) => a.nickname.length > b.nickname.length ? -1 : 1)[0];
  return longestNicknameUser ? longestNicknameUser.nickname.length : 0;
};

const getWindow = () => {
  const width = process.stdout.columns;
  const height = process.stdout.rows;
  const {
    safeWidth,
    safeHeight
  } = toSafeSize({
    width,
    height
  });
  const maxRows = safeHeight - 2;
  const maxColumns = safeWidth;
  return {
    width,
    height,
    safeHeight,
    safeWidth,
    maxRows,
    maxColumns
  };
};

class App extends _react.Component {
  constructor() {
    super();
    this.state = {
      connected: false,
      User: null,
      messageText: '',
      messages: [],
      users: [],
      ...getWindow()
    };
    this.handleFieldSubmit = this.handleFieldSubmit.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.addMessage = this.addMessage.bind(this);
  }

  addMessage(messageText, nickname) {
    this.setState({
      messageText: messageText,
      messages: [...this.state.messages, {
        nickname,
        id: (0, _v.default)(),
        text: messageText,
        timestamp: new Date().toLocaleTimeString('sv-SE')
      }].reverse().slice(0, getWindow().maxRows).reverse()
    });
  }

  handleFormSubmit(maxRows) {
    const {
      props,
      state,
      addMessage
    } = this;
    const User = state.User;
    const needReconnect = state.needReconnect;
    const {
      ChatConnection,
      connectToServer,
      emitMessage,
      nickname
    } = props;
    return function (e) {
      if (!e.messageText) return;

      if (e.messageText.startsWith('/nick ')) {
        if (User) return false;
        const split = e.messageText.split(' ');
        const nickname = split[1];
        if (!nickname) return;
        return connectToServer(nickname);
      }

      if (!nickname || needReconnect) {
        return addMessage('Type "/nick yourname" to connect to server', 'system');
      }

      emitMessage({
        text: e.messageText,
        User
      });
    };
  }

  handleFieldSubmit(form, handleSubmit) {
    return e => {
      setTimeout(form.reset);
      handleSubmit(e);
    };
  }

  componentDidMount() {
    const {
      ChatConnection
    } = this.props;

    if (this.props.options.nick) {
      this.props.connectToServer(this.props.options.nick);
    }

    onWindowSizeChange(() => {
      this.setState({ ...getWindow()
      });
    });
    ChatConnection.on('notification', message => {
      if (message.type === 'nicknameTaken') {
        this.addMessage(message.text, 'system');
        this.setState({
          connected: false,
          needReconnect: true
        });
        return;
      }

      if (message.type === 'userConnected' && message.User && message.User.nickname === this.props.nickname) {
        this.addMessage(`Welcome ${message.User.nickname}!`, 'system');

        if (this.props.options.selfHosted) {
          this.addMessage(`You are hosting this server on https://${this.props.options.host}:${this.props.options.port}`, 'system');
        }

        this.setState({
          users: message.users,
          User: message.User,
          connected: true,
          needReconnect: false
        });
        return;
      }

      if (message.type === 'userConnected') {
        this.setState({
          users: message.users
        });
      }

      if (message.type === 'userDisconnected') {
        this.setState({
          users: message.users
        });
      }

      this.addMessage(message.text, 'system');
    });
    ChatConnection.on('message-from-server', message => {
      const allowNotifications = this.state.User.registered && message.User.registered;

      if (allowNotifications && message.text.includes(`@${this.props.nickname}`)) {
        _nodeNotifier.default.notify({
          title: `@${message.User.nickname} mentioned you`,
          message: message.text
        });
      }

      this.addMessage(message.text, message.User.nickname);
    });
    ChatConnection.on('disconnect', username => {
      this.addMessage('Got disconnected from the server', 'system');
      this.props.onExit();
    });
  }

  componentWillUnmount() {
    this.props.onExit();
  }

  render() {
    const {
      safeHeight,
      safeWidth,
      maxRows,
      maxColumns,
      users,
      messages
    } = this.state;
    const userListWidth = getUserListWidth(users);
    const messagesWidth = this.state.maxColumns - userListWidth;
    return _react.default.createElement(_react.default.Fragment, null, _react.default.createElement(_ink.Box, {
      flexDirection: "column",
      height: safeHeight,
      width: safeWidth,
      textWrap: "truncate"
    }, _react.default.createElement(_ink.Box, null, _react.default.createElement(_messages.default, {
      messages: messages,
      maxRows: maxRows,
      height: maxRows,
      textWrap: "truncate",
      width: messagesWidth,
      paddingRight: 1
    }), _react.default.createElement(_userList.default, {
      users: users,
      width: userListWidth
    })), _react.default.createElement(_ink.Box, {
      marginTop: 1
    }, _react.default.createElement(_reactFinalForm.Form, {
      onSubmit: this.handleFormSubmit()
    }, ({
      form,
      handleSubmit
    }) => _react.default.createElement(_ink.Box, null, _react.default.createElement(_reactFinalForm.Field, {
      name: "messageText"
    }, ({
      input,
      meta
    }) => _react.default.createElement(_ink.Box, {
      flexDirection: "column"
    }, _react.default.createElement(_input.default, _extends({}, input, {
      showCursor: true,
      placeholder: 'Message',
      onSubmit: this.handleFieldSubmit(form, handleSubmit)
    })))))))));
  }

}

var _default = App;
exports.default = _default;