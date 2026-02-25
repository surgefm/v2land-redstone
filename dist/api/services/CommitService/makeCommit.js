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
const getLatestCommit_1 = __importDefault(require("./getLatestCommit"));
const EventService = __importStar(require("../EventService"));
const RecordService = __importStar(require("../RecordService"));
const RedisService = __importStar(require("../RedisService"));
const UtilService = __importStar(require("../UtilService"));
const ContributionService = __importStar(require("../ContributionService"));
const _Types_1 = require("@Types");
const lodash_1 = __importDefault(require("lodash"));
function makeCommit(eventId, authorId, summary, { description, parent, transaction } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const commitTime = new Date().toISOString().replace('T', ' ').replace('Z', ' +00:00');
        const eventObj = yield EventService.findEvent(eventId, { transaction, plain: true });
        if (!eventObj) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, `未找到该时间线：${eventId}`);
        }
        for (const stack of eventObj.stacks || []) {
            if (stack.news.length === 0 && !stack.stackEventId) {
                throw new _Types_1.RedstoneError(_Types_1.InvalidInputErrorType, `时间线上的进展必须有至少一条过审新闻或时间线`);
            }
        }
        delete eventObj.owner;
        const parentCommit = parent ? yield _Models_1.Commit.findByPk(parent) : yield (0, getLatestCommit_1.default)(eventObj.id);
        if (parentCommit) {
            delete parentCommit.data.commitTime;
            delete parentCommit.data.contribution;
            delete parentCommit.data.owner;
            if (lodash_1.default.isEqual(parentCommit.data, convertDateToString(eventObj))) {
                // Event data didn't change.
                return;
            }
        }
        eventObj.contribution = yield EventService.getContribution(eventObj, true);
        eventObj.commitTime = commitTime;
        const author = authorId instanceof _Models_1.Client
            ? authorId
            : yield _Models_1.Client.findByPk(authorId, { attributes: ['id'] });
        if (!author) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, `未找到该用户：${eventId}`);
        }
        let commit;
        yield UtilService.execWithTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            if (eventObj.status === 'hidden' && !parentCommit) {
                eventObj.status = 'admitted';
                const e = yield _Models_1.Event.findByPk(eventObj.id, { transaction });
                e.status = 'admitted';
                e.save({ transaction });
            }
            commit = yield _Models_1.Commit.create({
                authorId: author.id,
                eventId: eventObj.id,
                summary,
                description,
                time: commitTime,
                data: eventObj,
                diff: [],
                parentId: parentCommit ? parentCommit.id : null,
            }, { transaction });
            yield ContributionService.generateCommitContributionData(commit, { transaction });
            commit.data = Object.assign(Object.assign({}, commit.data), { contributors: yield EventService.getContributors(eventObj.id, { transaction }) });
            yield commit.save({ transaction });
            yield RecordService.create({
                model: 'Event',
                target: eventObj.id,
                subtarget: commit.id,
                action: 'makeCommitForEvent',
                owner: author.id,
            }, { transaction });
        }), transaction);
        yield RedisService.set(`commit-${eventObj.id}`, commit.get({ plain: true }));
        return commit;
    });
}
function convertDateToString(o) {
    for (const key of Object.keys(o)) {
        if (o[key] instanceof Date) {
            o[key] = o[key].toISOString();
        }
        else if (lodash_1.default.isObject(o[key])) {
            o[key] = convertDateToString(o[key]);
        }
    }
    return o;
}
exports.default = makeCommit;

//# sourceMappingURL=makeCommit.js.map
