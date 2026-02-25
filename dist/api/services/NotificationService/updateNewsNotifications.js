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
const ModeService = __importStar(require("../ModeService"));
function updateNewsNotifications(news, { transaction, force = false } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const recordCount = yield _Models_1.Record.count({
            where: {
                model: 'News',
                target: news.id,
                action: 'notifyNewNews',
            },
            transaction,
        });
        if (!force && recordCount)
            return;
        let stacks = news.stacks;
        if (!stacks) {
            stacks = yield news.$get('stacks', { transaction });
        }
        for (const stack of stacks) {
            const event = yield _Models_1.Event.findByPk(stack.eventId, {
                include: [{
                        model: _Models_1.News,
                        as: 'latestAdmittedNews',
                    }],
                transaction,
            });
            const latestNews = event.latestAdmittedNews;
            if (!force && (!latestNews || (+latestNews.id !== +news.id)))
                return;
            if (!transaction) {
                yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                    return updateNotifications(event, stack, news, transaction);
                }));
            }
            else {
                return updateNotifications(event, stack, news, transaction);
            }
        }
    });
}
function updateNotifications(event, stack, news, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const modes = ['new', '7DaysSinceLatestNews'];
        for (const mode of modes) {
            if (ModeService.getMode(mode).keepLatestOnly) {
                yield _Models_1.Notification.update({
                    status: 'discarded',
                }, {
                    where: {
                        eventId: event.id,
                        mode,
                    },
                    transaction,
                });
            }
            yield _Models_1.Notification.create({
                time: yield ModeService.getMode(mode).new({ event, stack, news, transaction }),
                status: 'pending',
                mode,
            }, { transaction });
        }
        yield _Models_1.Record.create({
            model: 'News',
            target: news.id,
            operation: 'create',
            action: 'notifyNewNews',
        }, { transaction });
    });
}
exports.default = updateNewsNotifications;

//# sourceMappingURL=updateNewsNotifications.js.map
