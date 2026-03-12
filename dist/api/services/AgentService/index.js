"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLock = exports.run = exports.ensureBotAccess = exports.getBotClientId = exports.getOrCreateBotClient = void 0;
var botClient_1 = require("./botClient");
Object.defineProperty(exports, "getOrCreateBotClient", { enumerable: true, get: function () { return botClient_1.getOrCreateBotClient; } });
Object.defineProperty(exports, "getBotClientId", { enumerable: true, get: function () { return botClient_1.getBotClientId; } });
var ensureBotAccess_1 = require("./ensureBotAccess");
Object.defineProperty(exports, "ensureBotAccess", { enumerable: true, get: function () { return ensureBotAccess_1.ensureBotAccess; } });
var run_1 = require("./run");
Object.defineProperty(exports, "run", { enumerable: true, get: function () { return run_1.run; } });
exports.AgentLock = __importStar(require("./lock"));

//# sourceMappingURL=index.js.map
