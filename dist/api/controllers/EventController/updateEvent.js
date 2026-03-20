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
function updateEvent(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = req.params.eventName;
        const event = yield _Services_1.EventService.findEvent(name);
        if (!req.body) {
            return res.status(400).json({
                message: '缺少参数',
            });
        }
        if (req.body.status && !req.currentClient.isEditor) {
            return res.status(403).json({
                message: '你没有修改事件状态的权限',
            });
        }
        if (!event) {
            return res.status(404).json({
                message: '未找到该事件',
            });
        }
        const e = _Services_1.EventService.updateEvent(event, req.body, req.currentClient);
        if (e === null) {
            return res.status(200).json({
                message: '什么变化也没有发生',
                event,
            });
        }
        res.status(201).json({
            message: '修改成功',
            event: e,
        });
    });
}
exports.default = updateEvent;

//# sourceMappingURL=updateEvent.js.map
