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
function getNewsList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let page = 1;
        let where;
        let withContributionData;
        let isManager = false;
        if (req.body && req.body.page) {
            page = req.body.page;
        }
        else if (req.query && req.query.page) {
            page = parseInt(req.query.page || '1');
        }
        if (req.body && req.body.where) {
            where = req.body.where;
        }
        else if (req.query && req.query.where) {
            where = req.query.where;
        }
        if (req.body && req.body.withContributionData) {
            withContributionData = req.body.withContributionData;
        }
        else if (req.query && req.query.withContributionData) {
            withContributionData = req.query.withContributionData;
        }
        if (where) {
            try {
                where = JSON.parse(where);
            }
            catch (err) { /* happy */ }
        }
        if (where && req.session.clientId) {
            if (yield _Services_1.AccessControlService.isClientEditor(req.session.clientId)) {
                isManager = true;
            }
        }
        if (where && !isManager) {
            where.status = 'admitted';
        }
        if (where) {
            where = _Services_1.UtilService.convertWhereQuery(where);
            const newsList = yield _Models_1.News.findAll({
                where,
                order: [['updatedAt', 'DESC']],
                offset: (page - 1) * 15,
                limit: 15,
            });
            yield _Services_1.NewsService.acquireContributionsByNewsList(newsList, withContributionData);
            res.status(200).json({ newsList });
        }
        else {
            res.status(400).json({
                message: '缺少参数：where',
            });
        }
    });
}
exports.default = getNewsList;

//# sourceMappingURL=getNewsList.js.map
