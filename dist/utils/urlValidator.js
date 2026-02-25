"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/camelcase */
const validator_1 = __importDefault(require("validator"));
function isURL(url) {
    return validator_1.default.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true,
    });
}
exports.default = isURL;

//# sourceMappingURL=urlValidator.js.map
