"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const Messages = props => {
  let messages = [...props.messages];
  messages.length = props.maxRows; // <Box><Color>Messages</Color></Box>

  return _react.default.createElement(_ink.Box, _extends({
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start"
  }, props), messages.map(message => _react.default.createElement(_ink.Box, {
    key: message.id,
    width: "100%",
    textWrap: "truncate"
  }, message.nickname === 'system' ? _react.default.createElement(_ink.Color, {
    yellow: true
  }, message.text) : _react.default.createElement(_ink.Color, {
    white: true
  }, "[", message.timestamp, "] ", message.nickname, ": ", message.text))));
};

var _default = Messages;
exports.default = _default;