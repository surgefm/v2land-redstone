"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const _Types_1 = require("@Types");
function validatePassword(value) {
    if (!lodash_1.default.isString(value)) {
        throw new _Types_1.RedstoneError(_Types_1.InvalidInputErrorType, '密码应为字符串类型');
    }
    else if (value.length < 6 || value.length > 64) {
        throw new _Types_1.RedstoneError(_Types_1.InvalidInputErrorType, '密码长度应在 6-64 个字符内');
    }
    else if (!(value.match(/[A-z]/i) && value.match(/[0-9]/))) {
        throw new _Types_1.RedstoneError(_Types_1.InvalidInputErrorType, '密码应为英文字符和数字结合');
    }
}
exports.default = validatePassword;

//# sourceMappingURL=validatePassword.js.map
