"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const unique_string_1 = __importDefault(require("unique-string"));
function generateFilename(file) {
    const { originalname } = file;
    const parts = originalname.split('.');
    const extension = parts[parts.length - 1].toLowerCase();
    const newFilename = (0, unique_string_1.default)() + Date.now() + '.' + extension;
    return newFilename;
}
exports.default = generateFilename;

//# sourceMappingURL=generateFilename.js.map
