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
function stopAgent(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = req.params.eventName;
        const eventId = yield _Services_1.EventService.getEventId(name);
        if (!eventId) {
            return res.status(404).json({ message: '未找到该事件' });
        }
        try {
            const running = yield _Services_1.AgentService.AgentLock.isLocked(eventId);
            if (!running) {
                return res.status(404).json({ message: '当前没有运行中的 Bot' });
            }
            // Set stop flag — the agentic loop will check this between iterations
            yield _Services_1.AgentService.AgentLock.requestStop(eventId);
            // Send a chat message notifying that stop was requested
            const botClient = yield _Services_1.AgentService.getOrCreateBotClient();
            yield _Services_1.ChatService.sendMessage('newsroom', botClient.id, 'Bot 已收到停止请求，将在当前操作完成后停止。', eventId);
            res.status(200).json({
                message: 'Bot 停止请求已发送',
                eventId,
            });
        }
        catch (err) {
            (req.log || console).error(err);
            res.status(500).json({ message: '停止 Bot 时发生错误' });
        }
    });
}
exports.default = stopAgent;

//# sourceMappingURL=stopAgent.js.map
