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
const lodash_1 = __importDefault(require("lodash"));
function getEventList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let page;
        let where;
        let mode; // 0: latest updated; 1:
        let isEditors = false;
        let getLatest = req.query.latest === '1';
        switch (req.method) {
            case 'GET':
                page = parseInt(req.query.page || '1');
                // 0: oldest event first (by first stack);
                // 1: newest event first (by latest news)
                mode = req.query.mode;
                if (req.query.where && typeof req.query.where === 'string') {
                    where = JSON.parse(where);
                }
                else if (req.query.status) {
                    where = {
                        status: req.query.status,
                    };
                }
                break;
            case 'POST':
                // 兼容古老代码 POST 方法
                page = req.body.page;
                where = req.body.where;
                mode = req.body.mode;
                break;
        }
        page = _Services_1.UtilService.validateNumber(page, 1);
        mode = _Services_1.UtilService.validateNumber(mode, 0);
        if (lodash_1.default.isUndefined(page)) {
            return res.status(400).json({
                message: '参数有误：page',
            });
        }
        if (lodash_1.default.isUndefined(mode)) {
            return res.status(400).json({
                message: '参数有误：mode',
            });
        }
        const key = `event-list-query-${JSON.stringify(where)}-${page}`;
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            if ((where || getLatest) && req.session && req.session.clientId) {
                isEditors = (yield _Services_1.AccessControlService.hasRole(req.session.clientId, _Services_1.AccessControlService.roles.editors))
                    || (yield _Services_1.AccessControlService.hasRole(req.session.clientId, _Services_1.AccessControlService.roles.admins));
            }
            if (where && !isEditors) {
                where.status = 'admitted';
            }
            if (getLatest) {
                getLatest = isEditors;
            }
            if (where) {
                where = _Services_1.UtilService.convertWhereQuery(where);
            }
            where = (where && Object.keys(where).length > 0) ? where : { status: 'admitted' };
            if (getLatest) {
                const events = yield _Models_1.Event.findAll({
                    where,
                    include: [{
                            as: 'headerImage',
                            model: _Models_1.HeaderImage,
                            required: false,
                        }, {
                            as: 'latestAdmittedNews',
                            model: _Models_1.News,
                            required: false,
                        }, {
                            as: 'tags',
                            model: _Models_1.Tag,
                            where: { status: 'visible' },
                            through: { attributes: [] },
                            required: false,
                        }],
                    order: [
                        [{ model: _Models_1.News, as: 'latestAdmittedNews' }, 'time', 'DESC'],
                        ['updatedAt', 'DESC'],
                    ],
                    limit: 15,
                    offset: 15 * (page - 1),
                    transaction,
                });
                const eventObjs = events.map(e => e.toJSON());
                yield _Services_1.EventService.acquireContributionsByEventList(eventObjs);
                res.status(200).json({ eventList: eventObjs });
            }
            else {
                const redisData = yield _Services_1.RedisService.get(key);
                if (redisData) {
                    return res.status(200).json({ eventList: redisData });
                }
                const whereQuery = _Services_1.UtilService.generateWhereQuery({ data: where });
                const whereClause = `WHERE ${whereQuery.query}`;
                const query = `
        SELECT *
        FROM (
          SELECT
            DISTINCT ON ("eventId") "eventId",
            (CASE WHEN "data"::json#>>'{stacks,0,time}' NOTNULL
              THEN "data"::json#>>'{stacks,0,time}'
            WHEN "data"::json#>>'{stacks,0,news,0}' NOTNULL
              THEN "data"::json#>>'{stacks,0,news,0,time}'
            WHEN "data"::json#>>'{latestAdmittedNews}' NOTNULL
              THEN "data"::json#>>'{latestAdmittedNews,time}'
              ELSE NULL
            END) as t,
            *
          FROM public.commit
          ${whereClause} AND time NOTNULL
          ORDER BY "eventId", "time" DESC
        ) as commit
        WHERE t NOTNULL
        ORDER BY t DESC
        LIMIT 15
        OFFSET ${15 * (page - 1)}
      `;
                const commits = yield _Models_1.sequelize.query(query, {
                    transaction,
                    type: _Models_1.Sequelize.QueryTypes.SELECT,
                    bind: whereQuery.values,
                });
                for (const commit of commits) {
                    delete commit.data.contribution;
                    delete commit.data.stacks;
                    commit.data.time = commit.t;
                }
                yield Promise.all(commits.map((c) => __awaiter(this, void 0, void 0, function* () {
                    c.data.starCount = yield _Services_1.StarService.countStars(c.eventId);
                    c.data.subscriptionCount = yield _Services_1.RedisService.hlen(_Services_1.RedisService.getSubscriptionCacheKey(c.eventId));
                    c.data.curations = yield _Services_1.EventService.getCurations(c.eventId);
                })));
                const data = commits.map(c => c.data);
                res.status(200).json({ eventList: commits.map(c => c.data) });
                yield _Services_1.RedisService.set(key, data);
                yield _Services_1.RedisService.expire(key, 30);
            }
        }));
    });
}
exports.default = getEventList;

//# sourceMappingURL=getEventList.js.map
