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
function addCurator(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tagId = +req.params.tagId;
        const curatorId = req.body.curatorId;
        if (!curatorId) {
            return res.status(400).json({
                message: '缺失参数: curatorId',
            });
        }
        const tagCurator = yield _Services_1.TagService.addCurator(tagId, curatorId, req.currentClient);
        if (tagCurator) {
            res.status(201).json({
                message: '成功添加话题主持人',
                tagId,
                curatorId,
            });
        }
        else {
            res.status(200).json({
                message: '该用户本来就是该话题主持人',
            });
        }
    });
}
exports.default = addCurator;

//# sourceMappingURL=addCurator.js.map
