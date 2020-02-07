"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _ink = require("ink");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const UserList = props => {
  if (!props.users || props.users.length === 0) {
    return _react.default.createElement(_ink.Box, {
      width: 10
    });
  }

  return _react.default.createElement(_ink.Box, {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: props.width
  }, props.users.map(User => _react.default.createElement(_ink.Box, {
    key: User.id
  }, _react.default.createElement(_ink.Color, {
    bold: true
  }, "@", User.nickname))));
};

var _default = UserList;
exports.default = _default;