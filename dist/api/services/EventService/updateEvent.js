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
const RecordService = __importStar(require("@Services/RecordService"));
const RedisService = __importStar(require("@Services/RedisService"));
const NotificationService = __importStar(require("@Services/NotificationService"));
const generatePinyin_1 = __importDefault(require("./generatePinyin"));
const updateAlgoliaIndex_1 = __importDefault(require("./updateAlgoliaIndex"));
function updateEvent(event, data, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const changes = {};
        for (const attribute of ['name', 'description', 'status', 'needContributor']) {
            if (data[attribute] !== 'undefined' && data[attribute] !== event[attribute]) {
                changes[attribute] = data[attribute];
            }
        }
        if (Object.getOwnPropertyNames(changes).length === 0)
            null;
        if (changes.name) {
            changes.pinyin = yield (0, generatePinyin_1.default)(changes.name);
        }
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const query = {
                model: 'Event',
                owner: client.id,
            };
            if (changes.status) {
                const oldStatus = event.status;
                event.status = changes.status;
                yield event.save({ transaction });
                yield RecordService.update(Object.assign(Object.assign({}, query), { action: 'updateEventStatus', data: { status: changes.status }, before: oldStatus, target: event.id }), { transaction });
            }
            if (changes.needContributor !== undefined) {
                const oldNeedContributor = event.needContributor;
                event.needContributor = changes.needContributor;
                yield event.save({ transaction });
                yield RecordService.update(Object.assign(Object.assign({}, query), { action: changes.needContributor ? 'openApplication' : 'closeApplication', data: { needContributor: changes.needContributor }, before: oldNeedContributor, target: event.id }), { transaction });
            }
            NotificationService.notifyWhenEventStatusChanged(event, changes, client);
            delete changes.status;
            delete changes.needContributor;
            const before = {};
            for (const i of Object.keys(changes)) {
                before[i] = event[i];
            }
            if (Object.keys(changes).length > 0) {
                for (const key of Object.keys(changes)) {
                    event[key] = changes[key];
                }
                yield event.save({ transaction });
                yield RecordService.update(Object.assign(Object.assign({}, query), { action: 'updateEventDetail', data: changes, before, target: event.id }), { transaction });
            }
        }));
        if (event.ownerId) {
            yield RedisService.set(RedisService.getEventIdKey(event.name, event.ownerId), event.id);
            const client = yield _Models_1.Client.findByPk(event.ownerId, { attributes: ['id'] });
            yield RedisService.set(RedisService.getEventIdKey(event.name, client.username), event.id);
        }
        (0, updateAlgoliaIndex_1.default)({ eventId: event.id });
        return event;
    });
}
exports.default = updateEvent;

//# sourceMappingURL=updateEvent.js.map
