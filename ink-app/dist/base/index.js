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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

class Base extends _react.Component {
  constructor() {
    super();

    const {
      height,
      width
    } = _windowSize.default.get();

    const safeHeight = height - 1;
    const safeWidth = width - 1;
    const headerHeight = 2;
    const inputHeight = 2;
    const maxRows = safeHeight - headerHeight - inputHeight;
    this.state = {
      connected: false,
      User: null,
      messageText: '',
      messages: [],
      users: [{
        nickname: 'seb',
        id: 1
      }, {
        nickname: 'karin andersson',
        id: 2
      }],
      safeHeight,
      safeWidth,
      maxRows,
      inputHeight,
      headerHeight
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
      }].reverse().slice(0, this.state.maxRows).reverse()
    });
  }

  handleFormSubmit() {
    const {
      props,
      state,
      addMessage
    } = this;
    const {
      ChatConnection,
      connectToServer,
      emitMessage,
      nickname
    } = props;
    return function (e) {
      if (!e.messageText) return;

      if (e.messageText.startsWith('/nick ')) {
        const split = e.messageText.split(' ');
        const nickname = split[1];
        if (!nickname) return;
        return connectToServer(nickname);
      }

      if (!nickname) {
        return addMessage('Type "/nick yourname" to set a nickname and start chatting', 'system');
      }

      emitMessage({
        text: e.messageText,
        nickname
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
    ChatConnection.on('notification', message => {
      if (message.type === 'userConnected' && message.user && message.user.nickname === this.props.nickname) {
        this.addMessage(`Welcome ${message.user.nickname}. Your ID is ${message.user.id}`, 'system');
        return this.setState({
          User: message.user,
          connected: true
        });
      }

      if (message.type === 'nicknameTaken') {
        return this.setState({
          connected: false
        });
      }

      this.addMessage(message.text, 'system');
    });
    ChatConnection.on('message-from-server', message => {
      this.addMessage(message.text, message.nickname);
    });
  }

  render() {
    const {
      inputHeight,
      headerHeight,
      safeWidth,
      safeHeight,
      maxRows,
      users,
      messages
    } = this.state;
    const longestName = [...this.state.users].sort((a, b) => a.nickname.length > b.nickname.length ? -1 : 1)[0].nickname.length;
    const userListWidth = longestName + 1;
    const messagesWidth = safeWidth - userListWidth;
    return _react.default.createElement(_react.default.Fragment, null, _react.default.createElement(_ink.Box, {
      flexDirection: "column",
      height: safeHeight,
      width: safeWidth
    }, _react.default.createElement(_ink.Box, null, _react.default.createElement(_ink.Color, {
      red: true
    }, "Connected: ", this.state.connected ? 'Yes' : 'No')), _react.default.createElement(_ink.Box, {
      height: maxRows
    }, _react.default.createElement(_messages.default, {
      messages: messages,
      maxRows: maxRows,
      width: messagesWidth
    }), _react.default.createElement(_userList.default, {
      users: users,
      width: userListWidth
    })), _react.default.createElement(_ink.Box, {
      paddingTop: 1
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

var _default = Base;
exports.default = _default;