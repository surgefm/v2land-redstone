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
const hasEventPermission = (action, errorMessage) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield _Services_1.AccessControlService.isAllowed(req.session.clientId, 'all-events', action))
        return next();
    const name = req.params.eventName;
    const eventId = yield _Services_1.EventService.getEventId(name);
    if (!eventId) {
        return res.status(404).json({ message: '未找到该事件' });
    }
    const event = yield _Services_1.EventService.findEvent(eventId, { eventOnly: true });
    if (!event) {
        return res.status(404).json({ message: '未找到该事件' });
    }
    if (event.status === 'admitted') {
        const permitted = yield _Services_1.AccessControlService.isAllowed(req.session.clientId, 'all-admitted-events', action);
        if (permitted)
            return next();
    }
    const resource = _Services_1.AccessControlService.getEventResourceId(eventId);
    const haveAccess = yield _Services_1.AccessControlService.isAllowed(req.session.clientId, resource, action);
    if (haveAccess)
        return next();
    return res.status(403).json({
        message: errorMessage || '用户没有该权限',
    });
});
exports.default = hasEventPermission;

//# sourceMappingURL=hasEventPermission.js.map
