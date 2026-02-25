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
// import urlTrimmer = require('v2land-url-trimmer');
function updateNews(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = +req.params.news;
        const data = req.body;
        let news = yield _Models_1.News.findByPk(id);
        if (!news) {
            return res.status(404).json({
                message: '未找到该新闻',
            });
        }
        // if (data.url) {
        //   data.url = (await urlTrimmer.trim(data.url)).toString();
        // }
        const changes = {};
        for (const i of ['url', 'source', 'title', 'abstract', 'time', 'status', 'comment', 'stackId', 'isInTemporaryStack']) {
            if (data[i] && data[i] !== news[i]) {
                changes[i] = data[i];
            }
        }
        if (Object.getOwnPropertyNames(changes).length === 0) {
            return res.status(200).json({
                message: '什么变化也没有发生',
                news,
            });
        }
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const changesCopy = Object.assign({}, changes);
            let newNews = news;
            if (changes.status) {
                const beforeStatus = news.status;
                newNews = yield news.update({
                    status: changes.status,
                }, { transaction });
                yield _Services_1.RecordService.create({
                    model: 'News',
                    action: 'updateNewsStatus',
                    before: beforeStatus,
                    data: changes.status,
                    target: news.id,
                    owner: req.session.clientId,
                }, { transaction });
                const events = yield news.$get('events', {
                    where: { status: 'admitted' },
                    attributes: ['id'],
                    transaction,
                });
                for (const event of events) {
                    const latestNews = (yield event.$get('news', {
                        where: { status: 'admitted' },
                        attributes: ['id'],
                        order: [['time', 'DESC']],
                        transaction,
                    }))[0];
                    const updateNotification = (latestNews && +latestNews.id === +news.id) ||
                        (changesCopy.status && changesCopy.status !== news.status) ||
                        (changesCopy.time && new Date(changesCopy.time).getTime() !== new Date(news.time).getTime());
                    yield _Services_1.EventService.updateAdmittedLatestNews(event.id, { transaction });
                    if (updateNotification) {
                        _Services_1.NotificationService.updateNewsNotifications(news, {
                            force: data.forceUpdate,
                        });
                    }
                }
                _Services_1.NotificationService.notifyWhenNewsStatusChanged(news, newNews, req.session.clientId);
                if (beforeStatus === 'admitted' && changes.status !== 'admitted') {
                    const stacks = yield news.$get('stacks', {
                        where: { status: 'admitted' },
                    });
                    for (const stack of stacks) {
                        const newsCount = yield stack.$count('news', {
                            where: { status: 'admitted' },
                            transaction,
                        });
                        if (!newsCount) {
                            yield stack.update({ status: 'invalid' }, { transaction });
                            yield _Services_1.RecordService.update({
                                action: 'invalidateStack',
                                data: { status: 'invalid' },
                                before: { status: 'admitted' },
                                model: 'Stack',
                                target: stack.id,
                                owner: req.session.clientId,
                            }, { transaction });
                        }
                    }
                }
            }
            delete changes.status;
            const before = {};
            for (const i of Object.keys(changes)) {
                before[i] = newNews[i];
            }
            if (Object.getOwnPropertyNames(changes).length > 0) {
                news = yield newNews.update(changes, { transaction });
                yield _Services_1.RecordService.update({
                    action: 'updateNewsDetail',
                    data: changes,
                    before,
                    target: news.id,
                    owner: req.session.clientId,
                    model: 'News',
                }, { transaction });
            }
            res.status(201).json({
                message: '修改成功',
                news,
            });
        }));
        _Services_1.NewsService.updateAlgoliaIndex({ newsId: id });
    });
}
exports.default = updateNews;

//# sourceMappingURL=updateNews.js.map
