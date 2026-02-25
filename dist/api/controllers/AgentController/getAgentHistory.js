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
const sequelize_1 = require("sequelize");
const _Services_1 = require("@Services");
const _Models_1 = require("@Models");
function getAgentHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = req.params.eventName;
        const eventId = yield _Services_1.EventService.getEventId(name);
        if (!eventId) {
            return res.status(404).json({ message: '未找到该事件' });
        }
        const clientId = req.session.clientId;
        const hasAccess = yield _Services_1.AccessControlService.isAllowedToViewNewsroomChat(clientId, eventId);
        if (!hasAccess) {
            return res.status(401).json({ message: '你没有权限浏览该编辑室' });
        }
        const type = req.query.type || 'status';
        const where = { eventId, type };
        if (req.query.before) {
            where.createdAt = { [sequelize_1.Op.lte]: req.query.before };
        }
        if (req.query.runId) {
            where.runId = req.query.runId;
        }
        const statuses = yield _Models_1.AgentStatus.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: 50,
        });
        const running = yield _Services_1.AgentService.AgentLock.isLocked(eventId);
        res.status(200).json({ statuses, running });
    });
}
exports.default = getAgentHistory;

//# sourceMappingURL=getAgentHistory.js.map
