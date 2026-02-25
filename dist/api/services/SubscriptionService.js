"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUnsubscribeId = void 0;
const unique_string_1 = __importDefault(require("unique-string"));
function generateUnsubscribeId() {
    return (0, unique_string_1.default)();
}
exports.generateUnsubscribeId = generateUnsubscribeId;

//# sourceMappingURL=SubscriptionService.js.map
