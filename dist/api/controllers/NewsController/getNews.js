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
function getNews(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let id;
        if (req.body && req.body.news) {
            id = req.body.news;
        }
        else if (req.query && req.query.news) {
            id = req.query.news;
        }
        else if (req.params.news) {
            id = req.params.news;
        }
        if (!id) {
            return res.status(400).json({
                message: '缺少参数：news。',
            });
        }
        const news = yield _Models_1.News.findOne({
            where: { id },
            include: [{
                    model: _Models_1.Stack,
                    as: 'stacks',
                }],
        });
        if (!news) {
            return res.status(404).json({ message: '未找到该新闻' });
        }
        const newsObj = news.get({ plain: true });
        if (news.status !== 'admitted') {
            if (!req.session.clientId || !(yield _Services_1.AccessControlService.isClientEditor(req.session.clientId))) {
                return res.status(404).json({ message: '该新闻尚未通过审核' });
            }
        }
        newsObj.contribution = yield _Services_1.NewsService.getContribution(news, true);
        res.status(200).json({ news: newsObj });
    });
}
exports.default = getNews;

//# sourceMappingURL=getNews.js.map
