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
function addTag(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.body.tag) {
            return res.status(400).json({
                message: '缺少参数：tag',
            });
        }
        const name = req.params.eventName;
        const eventId = yield _Services_1.EventService.getEventId(name);
        const eventTag = yield _Services_1.EventService.addTag(eventId, req.body.tag, req.session.clientId);
        if (!eventTag) {
            return res.status(200).json({
                message: `事件已有该话题。`,
            });
        }
        else {
            return res.status(201).json({
                message: `成功将话题添加至时间线中。`,
            });
        }
    });
}
exports.default = addTag;

//# sourceMappingURL=addTag.js.map
