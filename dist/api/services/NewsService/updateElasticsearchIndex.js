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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _Models_1 = require("@Models");
const ElasticsearchService_1 = __importDefault(require("../ElasticsearchService"));
function updateElasticsearchIndex({ news, newsId }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!news) {
            news = yield _Models_1.News.findOne({
                where: { id: newsId },
            });
        }
        let newsObj;
        if (news.get) {
            newsObj = news.get({ plain: true });
        }
        return ElasticsearchService_1.default.update({
            index: 'news',
            id: news.id,
            body: {
                'doc': newsObj,
                'doc_as_upsert': true,
            },
        });
    });
}
exports.default = updateElasticsearchIndex;

//# sourceMappingURL=updateElasticsearchIndex.js.map
