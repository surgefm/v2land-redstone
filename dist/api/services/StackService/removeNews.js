"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const _Types_1 = require("@Types");
const RecordService = __importStar(require("@Services/RecordService"));
const UtilService = __importStar(require("@Services/UtilService"));
function removeNews(stackId, newsId, clientId, { transaction, time } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const stack = yield _Models_1.Stack.findByPk(stackId, { transaction });
        if (!stack) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, '无法找到该进展');
        }
        const news = yield _Models_1.News.findByPk(newsId, { transaction });
        if (!news) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, '无法找到该新闻');
        }
        const eventStackNews = yield _Models_1.EventStackNews.findOne({
            where: {
                eventId: stack.eventId,
                stackId: stack.id,
                newsId: news.id,
            },
            transaction,
        });
        if (!eventStackNews)
            return;
        yield UtilService.execWithTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            yield RecordService.destroy({
                model: 'EventStackNews',
                data: eventStackNews,
                target: eventStackNews.stackId,
                subtarget: news.id,
                owner: clientId,
                action: 'removeNewsFromStack',
                createdAt: time,
                updatedAt: time,
            }, { transaction });
            eventStackNews.stackId = null;
            yield eventStackNews.save({ transaction });
        }), transaction);
        return eventStackNews;
    });
}
exports.default = removeNews;

//# sourceMappingURL=removeNews.js.map
