"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _ink = require("ink");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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