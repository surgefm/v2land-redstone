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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _Models_1 = require("@Models");
const AccessControlService = __importStar(require("@Services/AccessControlService"));
const StarService = __importStar(require("@Services/StarService"));
const sequelize_1 = require("sequelize");
const lodash_1 = __importDefault(require("lodash"));
const getContributors_1 = __importDefault(require("./getContributors"));
function findEvent(eventName, { eventOnly = false, plain = false, getNewsroomContent = false, transaction } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const where = lodash_1.default.isNaN(+eventName) ? { name: eventName } : { id: eventName };
        if (eventOnly) {
            const event = yield _Models_1.Event.findOne({
                where,
                include: [{
                        model: _Models_1.HeaderImage,
                        as: 'headerImage',
                        required: false,
                    }],
                transaction,
            });
            if (!event)
                return;
            if (plain)
                return event.get({ plain });
            return event;
        }
        let event = yield _Models_1.Event.findOne({
            attributes: {
                include: [[
                        _Models_1.Sequelize.literal(`(
          SELECT COUNT(stack)
          FROM "stack" AS stack
          WHERE stack."eventId" = event.id AND stack.order >= 0 AND stack.status = 'admitted'
        )`),
                        'stackCount',
                    ]],
            },
            where,
            include: [
                {
                    model: _Models_1.HeaderImage,
                    as: 'headerImage',
                    required: false,
                }, {
                    model: _Models_1.News,
                    as: 'offshelfNews',
                    where: {
                        id: {
                            [sequelize_1.Op.in]: _Models_1.Sequelize.literal(`(
              SELECT esn."newsId"
              FROM "eventStackNews" AS esn
              LEFT JOIN news as news ON esn."newsId" = news.id
              WHERE news.status = 'admitted' AND esn."stackId" IS NULL
            )`),
                        },
                    },
                    order: [['time', 'DESC']],
                    through: { attributes: [] },
                    required: false,
                }, {
                    model: _Models_1.Stack,
                    as: 'stacks',
                    where: Object.assign({ status: 'admitted' }, (getNewsroomContent ? {} : { order: { [sequelize_1.Op.gte]: 0 } })),
                    order: [['order', 'DESC']],
                    required: false,
                    include: [{
                            model: _Models_1.News,
                            as: 'news',
                            where: { status: 'admitted' },
                            order: [['time', 'ASC']],
                            through: { attributes: [] },
                            required: false,
                            include: [{
                                    model: _Models_1.Site,
                                    as: 'site',
                                    required: false,
                                }, {
                                    model: _Models_1.SiteAccount,
                                    as: 'siteAccount',
                                    required: false,
                                }],
                        }, {
                            model: _Models_1.Event,
                            as: 'stackEvent',
                            where: { status: 'admitted' },
                            required: false,
                            include: [{
                                    model: _Models_1.HeaderImage,
                                    as: 'headerImage',
                                    required: false,
                                }],
                        }],
                    attributes: {
                        include: [[
                                _Models_1.Sequelize.literal(`(
              SELECT COUNT(esn)
              FROM "eventStackNews" AS esn
              LEFT JOIN "news" AS news ON news.id = esn."newsId"
              WHERE esn."stackId" = stacks.id AND news.status = 'admitted'
            )`),
                                'newsCount',
                            ]],
                    },
                }, {
                    model: _Models_1.News,
                    as: 'latestAdmittedNews',
                    required: false,
                }, {
                    model: _Models_1.Tag,
                    as: 'tags',
                    where: { status: 'visible' },
                    through: { attributes: [] },
                    required: false,
                }, {
                    model: _Models_1.Client,
                    as: 'owner',
                    attributes: ['id', 'username', 'nickname', 'avatar', 'description'],
                    required: false,
                },
            ],
            transaction,
        });
        if (!event)
            return;
        if (plain)
            event = event.get({ plain });
        const [roles, contributors] = yield Promise.all([
            AccessControlService.getEventClients(event.id),
            (0, getContributors_1.default)(event.id, { transaction }),
        ]);
        event.roles = roles;
        event.contributors = contributors;
        event.stackCount = +event.stackCount;
        event.newsCount = 0;
        event.offshelfNews.sort((a, b) => (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        event.stacks.sort((a, b) => b.order - a.order);
        for (const stack of event.stacks) {
            stack.newsCount = +stack.newsCount;
            event.newsCount += stack.newsCount;
            stack.news.sort((a, b) => (new Date(a.time).getTime() - new Date(b.time).getTime()));
        }
        event.starCount = yield StarService.countStars(event.id);
        return event;
    });
}
exports.default = findEvent;

//# sourceMappingURL=findEvent.js.map
