"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const ui = {
  color: {
    guest: 'yellow',
    registered: 'green'
  }
};

const colorToObject = string => ({
  [string]: true
});

const getUserColor = User => {
  return User.registered ? colorToObject(ui.color.registered) : colorToObject(ui.color.guest);
};

const UserList = props => {
  return _react.default.createElement(_ink.Box, _extends({
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start"
  }, props), props.users.map(User => _react.default.createElement(_ink.Box, {
    key: User.id,
    hex: true
  }, _react.default.createElement(_ink.Color, _extends({
    bold: true
  }, getUserColor(User)), User.registered ? '@' : '', User.nickname))));
};

var _default = UserList;
exports.default = _default;