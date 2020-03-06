"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = require("react");

var _events = _interopRequireDefault(require("events"));

var _socket = _interopRequireDefault(require("socket.io-client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ChatConnector extends _react.Component {
  constructor() {
    super();
    this.state = {
      nickname: null,
      Peer: null,
      Stream: null,
      Reconnector: null,
      stopReconnecting: null,
      ChatConnection: new _events.default()
    };
    this.connectToServer = this.connectToServer.bind(this);
    this.emitMessage = this.emitMessage.bind(this);
  }

  emitMessage(message) {
    this.state.Peer.emit('message-to-server', message);
  }

  connectToServer(nickname) {
    const ChatConnection = this.state.ChatConnection;
    const port = this.props.options.port;
    const host = this.props.options.host;
    const Peer = (0, _socket.default)(`https://${host}:${port}`, {
      rejectUnauthorized: Boolean(this.props.options.rejectUnauthorized)
    });
    this.setState({
      nickname,
      Peer
    });
    Peer.on('connect', () => {
      Peer.emit('user-connect', nickname);
    });
    Peer.on('disconnect', () => {
      ChatConnection.emit('disconnect', nickname);
    });
    Peer.on('notification', message => {
      ChatConnection.emit('notification', message);
    });
    Peer.on('message-from-server', message => {
      ChatConnection.emit('message-from-server', message);
    });
  }

  render() {
    return this.props.children({
      ChatConnection: this.state.ChatConnection,
      connectToServer: this.connectToServer,
      setNickname: this.setNickname,
      nickname: this.state.nickname,
      emitMessage: this.emitMessage,
      stopReconnecting: () => {}
    });
  }

}

var _default = ChatConnector;
exports.default = _default;