"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Messages = props => {
  if (!props.messages || props.messages.length === 0) {
    return _react.default.createElement(_ink.Box, {
      width: props.width
    });
  }

  return _react.default.createElement(_ink.Box, {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: props.width,
    paddingRight: 2
  }, props.messages.map(message => _react.default.createElement(_ink.Box, {
    key: message.id,
    width: '100%',
    textWrap: "truncate"
  }, message.nickname === 'system' ? _react.default.createElement(_ink.Color, {
    yellow: true
  }, message.text) : _react.default.createElement(_ink.Color, {
    white: true
  }, "[", message.timestamp, "] ", message.nickname, ": ", message.text))));
};

var _default = Messages;
exports.default = _default;