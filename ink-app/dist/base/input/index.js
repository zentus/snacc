"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _inkTextInput = _interopRequireDefault(require("ink-text-input"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const Input = ({
  onBlur,
  onFocus,
  ...props
}) => {
  _react.default.useEffect(() => {
    onFocus();
    return onBlur;
  }, [onFocus, onBlur]);

  return _react.default.createElement(_inkTextInput.default, _extends({}, props, {
    showCursor: true
  }));
};

var _default = Input;
exports.default = _default;