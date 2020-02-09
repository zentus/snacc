"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _ink = require("ink");

var _app = _interopRequireDefault(require("./app"));

var _chatConnector = _interopRequireDefault(require("./chat-connector"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Index extends _react.Component {
  constructor() {
    super();
    this.state = {};
    this.forceUpdateRoot = this.forceUpdateRoot.bind(this);
  }

  forceUpdateRoot() {
    this.forceUpdate();
  }

  render() {
    return _react.default.createElement(_react.default.Fragment, null, _react.default.createElement(_ink.AppContext.Consumer, null, ({
      exit
    }) => {
      return _react.default.createElement(_ink.StdinContext.Consumer, null, ({
        isRawModeSupported,
        setRawMode,
        stdin
      }) => isRawModeSupported ? _react.default.createElement(_chatConnector.default, {
        host: this.props.host,
        port: this.props.port
      }, ({
        ChatConnection,
        connectToServer,
        emitMessage,
        nickname,
        setNickname,
        stopReconnecting
      }) => {
        return _react.default.createElement(_app.default, {
          onExit: exit,
          setRawMode: setRawMode,
          stdin: stdin,
          connectToServer: connectToServer,
          emitMessage: emitMessage,
          setNickname: setNickname,
          nickname: nickname,
          ChatConnection: ChatConnection,
          forceUpdateRoot: this.forceUpdateRoot,
          nickFlag: this.props.nickFlag,
          stopReconnecting: stopReconnecting
        });
      }) : _react.default.createElement(_ink.Color, {
        white: true
      }, "rawMode is not supported"));
    }));
  }

}

const startClient = (host, port, nickFlag) => (0, _ink.render)(_react.default.createElement(Index, {
  host: host,
  port: port,
  nickFlag: nickFlag
}));

var _default = startClient;
exports.default = _default;