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
function makeCommit(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventId = yield _Services_1.EventService.getEventId(req.params.eventName);
        if (!eventId) {
            return res.status(404).json({
                message: '未能找到该事件',
            });
        }
        const { clientId } = req.session;
        const summary = req.query.summary || req.body.summary;
        const commit = yield _Services_1.CommitService.makeCommit(eventId, clientId, summary);
        if (commit) {
            res.status(201).json({ commit });
        }
        else {
            res.status(200).json({
                message: '事件信息较上次保存没有变化',
            });
        }
    });
}
exports.default = makeCommit;

//# sourceMappingURL=makeCommit.js.map
