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
const v4_1 = __importDefault(require("uuid/v4"));
const _Models_1 = require("@Models");
const AccessControlService = __importStar(require("@Services/AccessControlService"));
const RecordService = __importStar(require("@Services/RecordService"));
const CommitService_1 = require("@Services/CommitService");
function addCuration(tagId, curatorId, eventId, state, comment = '') {
    return __awaiter(this, void 0, void 0, function* () {
        const hasAccess = yield AccessControlService.isAllowedToManageTag(curatorId, tagId);
        if (!hasAccess) {
            const tagCurator = yield _Models_1.TagCurator.findOne({
                where: { tagId, curatorId },
            });
            if (!tagCurator)
                return;
        }
        const eventTags = yield _Models_1.EventTag.findAll({ where: { eventId } });
        let found = false;
        for (const eventTag of eventTags) {
            const tag = yield _Models_1.Tag.findByPk(eventTag.tagId);
            if (tag.hierarchyPath.includes(tagId)) {
                found = true;
                break;
            }
        }
        if (!found)
            return;
        const latestCommit = yield (0, CommitService_1.getLatestCommit)(eventId);
        const commitId = latestCommit ? latestCommit.id : undefined;
        const curation = yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const existingCuration = yield _Models_1.TagCuration.findOne({
                where: { tagId, eventId, commitId },
                transaction,
            });
            if (existingCuration) {
                if (existingCuration.state === state && existingCuration.comment === comment)
                    return;
                const before = {
                    state: existingCuration.state,
                    comment: existingCuration.comment,
                    curatorId: existingCuration.curatorId,
                };
                existingCuration.state = state;
                existingCuration.comment = comment;
                existingCuration.curatorId = curatorId;
                yield existingCuration.save({ transaction });
                yield RecordService.update({
                    model: 'tagCuration',
                    action: 'updateTagCuration',
                    data: { state, comment },
                    targetUUID: existingCuration.id,
                    subtarget: eventId,
                    owner: curatorId,
                    before,
                }, { transaction });
                return existingCuration;
            }
            const data = { id: (0, v4_1.default)(), tagId, eventId, curatorId, state, comment, commitId };
            const curation = yield _Models_1.TagCuration.create(data, { transaction });
            yield RecordService.create({
                model: 'tagCuration',
                action: 'addTagCuration',
                data,
                targetUUID: curation.id,
                owner: curatorId,
            });
            return curation;
        }));
        return curation;
    });
}
exports.default = addCuration;

//# sourceMappingURL=addCuration.js.map
