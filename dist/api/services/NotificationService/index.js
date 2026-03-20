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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webpush = exports.notified = exports.getNextTime = exports.updateStackNotifications = exports.updateNewsNotifications = exports.notifyWhenStackStatusChanged = exports.notifyWhenNewsStatusChanged = exports.notifyWhenNewsCreated = exports.notifyWhenEventStatusChanged = exports.notifyWhenEventCreated = void 0;
const web_push_1 = __importDefault(require("web-push"));
exports.webpush = web_push_1.default;
const notifyWhenEventCreated_1 = __importDefault(require("./notifyWhenEventCreated"));
exports.notifyWhenEventCreated = notifyWhenEventCreated_1.default;
const notifyWhenEventStatusChanged_1 = __importDefault(require("./notifyWhenEventStatusChanged"));
exports.notifyWhenEventStatusChanged = notifyWhenEventStatusChanged_1.default;
const notifyWhenNewsCreated_1 = __importDefault(require("./notifyWhenNewsCreated"));
exports.notifyWhenNewsCreated = notifyWhenNewsCreated_1.default;
const notifyWhenNewsStatusChanged_1 = __importDefault(require("./notifyWhenNewsStatusChanged"));
exports.notifyWhenNewsStatusChanged = notifyWhenNewsStatusChanged_1.default;
const notifyWhenStackStatusChanged_1 = __importDefault(require("./notifyWhenStackStatusChanged"));
exports.notifyWhenStackStatusChanged = notifyWhenStackStatusChanged_1.default;
const updateNewsNotifications_1 = __importDefault(require("./updateNewsNotifications"));
exports.updateNewsNotifications = updateNewsNotifications_1.default;
const updateStackNotifications_1 = __importDefault(require("./updateStackNotifications"));
exports.updateStackNotifications = updateStackNotifications_1.default;
const ModeService = __importStar(require("../ModeService"));
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    web_push_1.default.setVapidDetails('mailto:hi@surge.fm', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
}
function getNextTime(mode, event) {
    return __awaiter(this, void 0, void 0, function* () {
        return ModeService.getMode(mode).new({ event });
    });
}
exports.getNextTime = getNextTime;
function notified(mode, event) {
    return __awaiter(this, void 0, void 0, function* () {
        return ModeService.getMode(mode).notified({ event });
    });
}
exports.notified = notified;

//# sourceMappingURL=index.js.map
