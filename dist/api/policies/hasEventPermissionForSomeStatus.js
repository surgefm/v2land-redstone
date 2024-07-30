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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _Services_1 = require("@Services");
const lodash_1 = __importDefault(require("lodash"));
const hasEventPermissionForSomeStatus = (errorMessage) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const eventId = yield _Services_1.EventService.getEventId(req.params);
    const event = yield _Services_1.EventService.findEvent(eventId, { eventOnly: true });
    let haveAccess = false;
    if (lodash_1.default.isUndefined(event)) {
        return res.status(404).json({
            message: '用户请求的事件不存在',
        });
    }
    if (event.status === 'admitted') {
        haveAccess = true;
    }
    else {
        if (!req.session.clientId) {
            return res.status(401).json({
                message: '请在登录后进行该操作',
            });
        }
        if (event.status === 'hidden' || event.status === 'removed') {
            haveAccess = yield _Services_1.AccessControlService.hasRole(req.session.clientId, _Services_1.AccessControlService.getEventViewRolePlain(eventId));
        }
        else if (event.status === 'rejected') {
            haveAccess = yield _Services_1.AccessControlService.hasRole(req.session.clientId, _Services_1.AccessControlService.getEventOwnerRolePlain(eventId));
        }
        haveAccess = haveAccess || (yield _Services_1.AccessControlService.isClientManager(req.session.clientId));
    }
    if (haveAccess)
        return next();
    return res.status(403).json({
        message: errorMessage || '用户没有查看事件的权限',
    });
});
exports.default = hasEventPermissionForSomeStatus;

//# sourceMappingURL=hasEventPermissionForSomeStatus.js.map
