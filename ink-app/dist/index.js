"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _ink = require("ink");

var _app = _interopRequireDefault(require("./app"));

var _chatConnector = _interopRequireDefault(require("./chat-connector"));

var _axios = _interopRequireDefault(require("axios"));

var _https = _interopRequireDefault(require("https"));

var _package = _interopRequireDefault(require("../../package.json"));

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
        options: this.props.options
      }, ({
        ChatConnection,
        connectToServer,
        emitMessage,
        nickname,
        setNickname,
        stopReconnecting
      }) => {
        return _react.default.createElement(_app.default, {
          options: this.props.options,
          onExit: exit,
          setRawMode: setRawMode,
          stdin: stdin,
          connectToServer: connectToServer,
          emitMessage: emitMessage,
          setNickname: setNickname,
          nickname: nickname,
          ChatConnection: ChatConnection,
          forceUpdateRoot: this.forceUpdateRoot,
          stopReconnecting: stopReconnecting
        });
      }) : _react.default.createElement(_ink.Color, {
        white: true
      }, "rawMode is not supported"));
    }));
  }

}

const getHostUrl = options => `https://${options.host}:${options.port}`;

const startClient = async options => {
  const endpoint = `${getHostUrl(options)}/version`;

  try {
    const response = await (0, _axios.default)(endpoint, {
      httpsAgent: new _https.default.Agent({
        rejectUnauthorized: options.rejectUnauthorized
      })
    });
    const serverVersion = response.data;
    const clientVersion = _package.default.version;
    const versionsMatch = serverVersion === clientVersion;

    if (versionsMatch) {
      return (0, _ink.render)(_react.default.createElement(Index, {
        options: options
      }));
    }

    console.log(`
			Version mismatch:
			Server uses snacc ${serverVersion}
			Client uses snacc ${clientVersion}
			Please use the same version on both server and client`);
  } catch (error) {
    const status = error.response ? `${error.response.status} ${error.response.statusText}` : 'No response';
    console.log(`Could not get server version (${endpoint}).\nStatus: ${status}`);
    process.exit(1);
  }
};

var _default = startClient;
exports.default = _default;