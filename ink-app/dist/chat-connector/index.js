"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _duplexEmitter = _interopRequireDefault(require("../../../duplex-emitter"));

var _reconnect = _interopRequireDefault(require("reconnect"));

var _events = _interopRequireDefault(require("events"));

var _socket = _interopRequireDefault(require("socket.io-client"));

var _package = _interopRequireDefault(require("../../../package"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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