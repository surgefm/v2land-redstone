"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _Services_1 = require("@Services");
function getAgentStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = req.params.eventName;
        const eventId = yield _Services_1.EventService.getEventId(name);
        if (!eventId) {
            return res.status(404).json({ message: '未找到该事件' });
        }
        const running = yield _Services_1.AgentService.AgentLock.isLocked(eventId);
        res.status(200).json({
            eventId,
            running,
        });
    });
}
exports.default = getAgentStatus;

//# sourceMappingURL=getAgentStatus.js.map
