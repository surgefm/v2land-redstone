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
function addCuration(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tagId = +req.params.tagId;
        const curatorId = req.session.clientId;
        const eventId = +req.params.eventId;
        const { state, comment } = req.body;
        if (!eventId) {
            return res.status(400).json({
                message: '缺失参数: eventId',
            });
        }
        if (!['certified', 'need improvement', 'warning'].includes(state)) {
            return res.status(400).json({
                message: '参数 state 必须为 "certified", "need improvement" 或 "warning"',
            });
        }
        const curation = yield _Services_1.TagService.addCuration(tagId, curatorId, eventId, state, comment);
        if (curation) {
            res.status(201).json({
                message: '成功添加点评',
                curation,
            });
        }
        else {
            res.status(200).json({
                message: '添加失败',
            });
        }
    });
}
exports.default = addCuration;

//# sourceMappingURL=addCuration.js.map
