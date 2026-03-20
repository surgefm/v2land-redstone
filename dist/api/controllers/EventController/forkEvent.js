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
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
function forkEvent(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventId = yield _Services_1.EventService.getEventId(req.params.eventName);
        if (!eventId) {
            return res.status(404).json({
                message: '未能找到该事件',
            });
        }
        const origEvent = yield _Models_1.Event.findByPk(eventId);
        const event = yield _Services_1.EventService.forkEvent(eventId, req.currentClient);
        return res.status(201).json({
            message: `成功复制「${origEvent.name}」`,
            event,
        });
    });
}
exports.default = forkEvent;

//# sourceMappingURL=forkEvent.js.map
