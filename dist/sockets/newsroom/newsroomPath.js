"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = __importDefault(require("@Configs/globals"));
const url = new URL(globals_1.default.api);
const newsroomPath = url.pathname.length > 1 ? `${url.pathname}/newsroom` : '/newsroom';
exports.default = newsroomPath;

//# sourceMappingURL=newsroomPath.js.map
