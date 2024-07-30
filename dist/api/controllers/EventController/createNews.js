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
const _Services_1 = require("@Services");
const axios_1 = __importDefault(require("axios"));
// const urlTrimmer = require('v2land-url-trimmer');
function createNews(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = req.params.eventName;
        const data = req.body;
        let client;
        if (req.session.clientId) {
            client = yield _Models_1.Client.findByPk(req.session.clientId);
        }
        for (const attr of ['url', 'source', 'title', 'time']) {
            if (!data[attr]) {
                return res.status(400).json({
                    message: `缺少 ${attr} 参数`,
                });
            }
        }
        // data.url = (await urlTrimmer.trim(data.url)).toString();
        const event = yield _Services_1.EventService.findEvent(name);
        if (!event) {
            return res.status(404).json({
                message: '未找到该事件',
            });
        }
        let stack;
        if (data.stackId) {
            stack = yield _Services_1.StackService.findStack(data.stackId, false);
            if (!stack || stack.eventId != event.id) {
                return res.status(404).json({
                    message: '未找到该进展或该进展不属于目标事件',
                });
            }
        }
        data.status = 'admitted';
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            let news = yield _Models_1.News.findOne({
                where: { url: data.url },
                transaction,
            });
            if (news) {
                const existingRelation = yield _Models_1.EventStackNews.findOne({
                    where: {
                        eventId: event.id,
                        newsId: news.id,
                    },
                });
                if (existingRelation) {
                    return res.status(409).json({
                        message: '审核队列或新闻合辑内已有相同链接的新闻',
                    });
                }
            }
            // Ask the Wayback Machine of Internet Archive to archive the webpage.
            (() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield axios_1.default.get(`https://web.archive.org/save/${data.url}`);
                }
                catch (err) { }
            }))();
            const time = new Date();
            if (!news) {
                news = yield _Models_1.News.create({
                    url: data.url,
                    abstract: data.abstract,
                    source: data.source,
                    title: data.title,
                    time: data.time,
                    comment: data.comment,
                    status: 'admitted',
                }, {
                    transaction,
                });
                yield _Services_1.RecordService.create({
                    model: 'News',
                    data: news.get({ plain: true }),
                    target: news.id,
                    action: 'createNews',
                    owner: req.session.clientId,
                    createdAt: time,
                }, { transaction });
            }
            // Add news to event and stack
            const eventNews = yield _Models_1.EventStackNews.create({
                eventId: event.id,
                stackId: stack ? stack.id : undefined,
                newsId: news.id,
            }, { transaction });
            yield _Services_1.RecordService.create({
                model: 'EventStackNews',
                data: eventNews,
                target: event.id,
                subtarget: news.id,
                action: 'addNewsToEvent',
                owner: req.session.clientId,
                createdAt: time,
            }, { transaction });
            // Add news to stack
            if (stack) {
                yield _Services_1.RecordService.create({
                    model: 'EventStackNews',
                    data: eventNews,
                    target: stack.id,
                    subtarget: news.id,
                    action: 'addNewsToStack',
                    owner: req.session.clientId,
                    createdAt: time,
                }, { transaction });
            }
            res.status(201).json({
                message: '提交成功',
                news,
            });
            const socket = yield _Services_1.EventService.getNewsroomSocket(event.id);
            socket.emit('add news to event', {
                eventStackNews: eventNews,
                event,
                news,
                client: yield _Models_1.Client.findByPk(req.session.clientId),
            });
            try {
                yield _Services_1.NotificationService.notifyWhenNewsCreated(news, client);
            }
            catch (err) { }
            try {
                yield _Services_1.NewsService.updateElasticsearchIndex({ newsId: news.id });
            }
            catch (err) { }
        }));
    });
}
exports.default = createNews;

//# sourceMappingURL=createNews.js.map
