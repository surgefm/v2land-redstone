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
const _Services_1 = require("@Services");
const _Models_1 = require("@Models");
const AccessControlService_1 = require("@Services/AccessControlService");
function createEvent(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(req.body && req.body.name && req.body.description)) {
            return res.status(400).json({
                message: '缺少参数 name 或 description',
            });
        }
        const data = {
            name: req.body.name,
            description: req.body.description,
            ownerId: req.session.clientId,
        };
        let event = yield _Services_1.EventService.findEvent(data.name);
        if (event) {
            return res.status(409).json({
                message: '已有同名事件或事件正在审核中',
            });
        }
        data.status = 'admitted';
        data.pinyin = yield _Services_1.EventService.generatePinyin(data.name);
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            event = yield _Models_1.Event.create(data, { transaction });
            yield _Services_1.RecordService.create({
                model: 'Event',
                data,
                action: 'createEvent',
                owner: req.session.clientId,
                target: event.id,
            }, { transaction });
        }));
        yield (0, AccessControlService_1.setClientEventOwner)(req.session.clientId, event.id);
        yield _Services_1.RedisService.set(_Services_1.RedisService.getEventIdKey(event.name, event.ownerId), event.id);
        yield _Services_1.RedisService.set(_Services_1.RedisService.getEventIdKey(event.name, req.currentClient.username), event.id);
        res.status(201).json({
            message: '提交成功，该事件在社区管理员审核通过后将很快开放',
            event,
        });
        _Services_1.NotificationService.notifyWhenEventCreated(event, req.session.clientId);
        _Services_1.EventService.updateAlgoliaIndex({ event });
    });
}
exports.default = createEvent;

//# sourceMappingURL=createEvent.js.map
