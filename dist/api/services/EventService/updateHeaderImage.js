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
const _Types_1 = require("@Types");
const _Models_1 = require("@Models");
const RecordService = __importStar(require("@Services/RecordService"));
const urlValidator_1 = __importDefault(require("@Utils/urlValidator"));
const updateAlgoliaIndex_1 = __importDefault(require("./updateAlgoliaIndex"));
function updateHeaderImage(eventId, data, clientId) {
    return __awaiter(this, void 0, void 0, function* () {
        const event = yield _Models_1.Event.findByPk(eventId, {
            include: [{
                    model: _Models_1.HeaderImage,
                    as: 'headerImage',
                    required: false,
                }],
        });
        if (!event) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, `未找到该事件`);
        }
        let headerImage = { eventId };
        for (const attribute of ['imageUrl', 'source', 'sourceUrl']) {
            headerImage[attribute] = data[attribute];
        }
        if (headerImage.imageUrl && !headerImage.source) {
            throw new _Types_1.RedstoneError(_Types_1.InvalidInputErrorType, '请提供题图来源');
        }
        if (headerImage.sourceUrl && !(0, urlValidator_1.default)(headerImage.sourceUrl)) {
            throw new _Types_1.RedstoneError(_Types_1.InvalidInputErrorType, '链接格式不规范');
        }
        const query = {
            model: 'HeaderImage',
            owner: clientId,
            data: headerImage,
        };
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            if (event.headerImage) {
                if (headerImage.imageUrl) {
                    for (const key of Object.keys(headerImage)) {
                        event.headerImage[key] = headerImage[key];
                    }
                    yield event.headerImage.save({ transaction });
                    yield RecordService.update(Object.assign(Object.assign({}, query), { action: 'updateEventHeaderImage', target: event.headerImage.id, before: event.headerImage }), { transaction });
                    headerImage = event.headerImage;
                }
                else {
                    yield _Models_1.HeaderImage.destroy({
                        where: { eventId },
                        transaction,
                    });
                    yield RecordService.destroy(Object.assign(Object.assign({}, query), { action: 'destroyEventHeaderImage', target: event.headerImage.id, before: event.headerImage }), { transaction });
                    headerImage = {};
                }
            }
            else {
                headerImage = yield _Models_1.HeaderImage.create(Object.assign(Object.assign({}, headerImage), { eventId: event.id }), { transaction });
                yield RecordService.create(Object.assign(Object.assign({}, query), { target: headerImage.id, action: 'createEventHeaderImage' }), { transaction });
            }
        }));
        (0, updateAlgoliaIndex_1.default)({ eventId });
        return headerImage;
    });
}
exports.default = updateHeaderImage;

//# sourceMappingURL=updateHeaderImage.js.map
