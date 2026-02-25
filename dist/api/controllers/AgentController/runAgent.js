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
function runAgent(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = req.params.eventName;
        const eventId = yield _Services_1.EventService.getEventId(name);
        if (!eventId) {
            return res.status(404).json({ message: '未找到该事件' });
        }
        const { message } = req.body || {};
        const locked = yield _Services_1.AgentService.AgentLock.isLocked(eventId);
        if (locked) {
            // Agent already running — push message to inbox if provided
            if (message) {
                yield _Services_1.AgentService.AgentLock.pushToInbox(eventId, message);
            }
            return res.status(409).json({ message: 'Bot 已在运行中' });
        }
        // Fire and forget — agent runs in background
        _Services_1.AgentService.run(eventId, message).catch((err) => {
            console.error(`[AgentController] Agent run error for event ${eventId}:`, err);
        });
        res.status(202).json({
            message: 'Agent 已启动',
            eventId,
        });
    });
}
exports.default = runAgent;

//# sourceMappingURL=runAgent.js.map
