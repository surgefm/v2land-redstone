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
const sequelize_1 = require("sequelize");
function updateStackNotifications(stack, { transaction, force = false } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const latestStack = yield _Models_1.Stack.findOne({
            where: {
                eventId: stack.eventId,
                status: 'admitted',
                order: { [sequelize_1.Op.gte]: 0 },
            },
            order: [['order', 'DESC']],
            attributes: ['id'],
            transaction,
        });
        if (!force && (!latestStack || (+latestStack.id !== +stack.id)))
            return;
        const recordCount = yield _Models_1.Record.count({
            where: {
                model: 'Stack',
                target: stack.id,
                action: 'notifyNewStack',
            },
            transaction,
        });
        if (!force && recordCount)
            return;
        let event = stack.event;
        if (typeof event !== 'object') {
            event = yield _Models_1.Event.findByPk(stack.eventId, { transaction });
        }
        if (!transaction) {
            yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                return updateNotifications(event, stack, transaction);
            }));
        }
        else {
            return updateNotifications(event, stack, transaction);
        }
    });
}
function updateNotifications(event, stack, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const modes = ['EveryNewStack', '30DaysSinceLatestStack'];
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
                time: yield ModeService.getMode(mode).new({ event, stack, transaction }),
                status: 'pending',
                eventId: event.id,
                mode,
            }, { transaction });
        }
        yield _Models_1.Record.create({
            model: 'Stack',
            target: stack.id,
            operation: 'create',
            action: 'notifyNewStack',
        }, { transaction });
    });
}
exports.default = updateStackNotifications;

//# sourceMappingURL=updateStackNotifications.js.map
