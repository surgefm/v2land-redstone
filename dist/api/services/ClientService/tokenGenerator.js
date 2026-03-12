"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const v4_1 = __importDefault(require("uuid/v4"));
const crypto_1 = __importDefault(require("crypto"));
function tokenGenerator() {
    const token = (0, v4_1.default)();
    return crypto_1.default
        .createHash('sha256')
        .update(token, 'utf8')
        .digest('hex');
}
exports.default = tokenGenerator;

//# sourceMappingURL=tokenGenerator.js.map
