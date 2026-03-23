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
const AccessControlService = __importStar(require("@Services/AccessControlService"));
const RecordService = __importStar(require("@Services/RecordService"));
function addCurator(tagId, curatorId, by) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingTagCurator = yield _Models_1.TagCurator.findOne({
            where: { tagId, curatorId },
        });
        if (existingTagCurator)
            return null;
        const tag = yield _Models_1.Tag.findByPk(tagId);
        if (!tag) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, `未找到该话题：${tagId}`);
        }
        const client = yield _Models_1.Client.findByPk(curatorId);
        if (!client) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, `未找到该用户：${curatorId}`);
        }
        const byClient = typeof by === 'number' ? yield _Models_1.Client.findByPk(by) : by;
        if (by && !byClient) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, `未找到该用户：${by}`);
        }
        let tagCurator = null;
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            tagCurator = yield _Models_1.TagCurator.create({ tagId, curatorId }, { transaction });
            yield RecordService.create({
                model: 'TagCurator',
                action: 'addTagCurator',
                data: tagCurator,
                target: tag.id,
                subtarget: curatorId,
                client: byClient.id,
            }, { transaction });
            yield AccessControlService.allowClientToManageTag(curatorId, tagId);
        }));
        return tagCurator;
    });
}
exports.default = addCurator;

//# sourceMappingURL=addCurator.js.map
