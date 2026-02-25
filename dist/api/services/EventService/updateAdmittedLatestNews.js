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
function updateAdmittedLatestNews(eventId, { transaction }) {
    return __awaiter(this, void 0, void 0, function* () {
        const event = yield _Models_1.Event.findByPk(eventId);
        const latestAdmittedNews = yield event.$get('news', {
            where: { status: 'admitted' },
            order: [['time', 'DESC']],
            transaction,
        });
        if (latestAdmittedNews.length === 0)
            return;
        event.latestAdmittedNewsId = latestAdmittedNews[0].id;
        yield event.save({ transaction });
    });
}
exports.default = updateAdmittedLatestNews;

//# sourceMappingURL=updateAdmittedLatestNews.js.map
