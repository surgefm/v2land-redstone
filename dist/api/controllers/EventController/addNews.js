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
function addNews(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.body || !req.body.newsId) {
            return res.status(400).json({
                message: '缺少参数：newsId。',
            });
        }
        const id = req.params.eventName;
        const esn = yield _Services_1.EventService.addNews(id, req.body.newsId, req.currentClient.id);
        if (!esn) {
            return res.status(200).json({
                message: '该新闻已在该进展中',
            });
        }
        return res.status(201).json({
            message: '成功将新闻添加至进展中',
        });
    });
}
exports.default = addNews;

//# sourceMappingURL=addNews.js.map
