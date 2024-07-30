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
const findEvent_1 = __importDefault(require("./findEvent"));
const generatePinyin_1 = __importDefault(require("./generatePinyin"));
const getContributors_1 = __importDefault(require("./getContributors"));
const UtilService = __importStar(require("../UtilService"));
const RecordService = __importStar(require("../RecordService"));
const RedisService = __importStar(require("../RedisService"));
const CommitService = __importStar(require("../CommitService"));
const ContributionService = __importStar(require("../ContributionService"));
const _Types_1 = require("@Types");
const lodash_1 = __importDefault(require("lodash"));
function forkEvent(eventId, userId, { transaction } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const forkTime = new Date();
        const commit = yield CommitService.getLatestCommit(eventId);
        if (!commit) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, `未找到该事件的记录：${eventId}`);
        }
        const event = commit.data;
        const user = userId instanceof _Models_1.Client
            ? userId
            : yield _Models_1.Client.findByPk(userId, { attributes: ['id'] });
        if (!user) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, `未找到该用户：${eventId}`);
        }
        let newEvent;
        yield UtilService.execWithTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const newEventName = yield getNewEventName(event.name, user.id, transaction);
            newEvent = yield _Models_1.Event.create({
                name: newEventName,
                pinyin: yield (0, generatePinyin_1.default)(newEventName),
                description: event.description,
                latestAdmittedNewsId: event.latestAdmittedNewsId,
                status: 'hidden',
                parentId: event.id,
                ownerId: user.id,
            }, { transaction });
            if (event.headerImage) {
                yield _Models_1.HeaderImage.create(Object.assign(Object.assign({}, event.headerImage), { eventId: newEvent.id, id: undefined }), { transaction });
            }
            const stackQueue = event.stacks.map((stack) => __awaiter(this, void 0, void 0, function* () {
                const newStack = yield _Models_1.Stack.create(Object.assign(Object.assign({}, lodash_1.default.pick(stack, ['title', 'description', 'status', 'order', 'time'])), { eventId: newEvent.id }), { transaction });
                yield RecordService.create({
                    model: 'Stack',
                    action: 'copyStackWhenForkingEvent',
                    owner: user.id,
                    target: stack.id,
                    subtarget: newStack.id,
                    data: newStack,
                }, { transaction });
                const esnData = stack.news.map(news => ({
                    eventId: newEvent.id,
                    stackId: newStack.id,
                    newsId: news.id,
                }));
                yield _Models_1.EventStackNews.bulkCreate(esnData, { transaction });
            }));
            yield Promise.all(stackQueue);
            const tagData = event.tags.map(tag => ({
                eventId: newEvent.id,
                tagId: tag.id,
            }));
            yield _Models_1.EventTag.bulkCreate(tagData, { transaction });
            const newEventData = yield (0, findEvent_1.default)(newEvent.id, { transaction, plain: true });
            const summary = event.owner
                ? `Forked from ${event.owner.username}’s ${event.name} #${event.id}`
                : `Forked from ${event.name} #${event.id}`;
            const newCommit = yield _Models_1.Commit.create({
                summary,
                data: newEventData,
                description: `${commit.summary}\n\n${commit.description}`,
                authorId: user.id,
                eventId: newEvent.id,
                isForkCommit: true,
                diff: [],
                time: forkTime.toISOString().replace('T', ' ').replace('Z', ' +00:00'),
            }, { transaction });
            yield RecordService.create({
                model: 'Event',
                action: 'forkEvent',
                target: event.id,
                subtarget: newEvent.id,
                owner: user.id,
                createdAt: forkTime,
                updatedAt: forkTime,
            }, { transaction });
            yield ContributionService.generateCommitContributionData(newCommit, { transaction });
            newCommit.data.contributors = yield (0, getContributors_1.default)(newEvent.id, { transaction });
            newCommit.parentId = commit.id;
            yield newCommit.save({ transaction });
            yield RedisService.set(`commit-${newEvent.id}`, newCommit.get({ plain: true }));
        }), transaction);
        return newEvent;
    });
}
function getNewEventName(eventName, clientId, transaction, count = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        const newEventName = count === 1 ? eventName : `${eventName}(${count})`;
        const existingEvent = yield _Models_1.Event.findOne({
            where: {
                name: newEventName,
                ownerId: clientId,
            },
            attributes: ['id'],
            transaction,
        });
        if (existingEvent)
            return getNewEventName(eventName, clientId, transaction, count + 1);
        return newEventName;
    });
}
exports.default = forkEvent;

//# sourceMappingURL=forkEvent.js.map
