"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Header = props => {
  return _react.default.createElement(_ink.Box, {
    height: props.height,
    paddingBottom: 1,
    paddingTop: 1
  }, _react.default.createElement(_ink.Box, {
    width: props.messagesWidth
  }, _react.default.createElement(_ink.Color, {
    blue: true
  }, "#general")), _react.default.createElement(_ink.Box, {
    width: props.userListWidth
  }, _react.default.createElement(_ink.Color, {
    blue: true
  }, "Users")));
};

var _default = Header;
exports.default = _default;