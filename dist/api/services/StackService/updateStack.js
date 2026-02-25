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
const NotificationService = __importStar(require("../NotificationService"));
const RecordService = __importStar(require("../RecordService"));
const addEvent_1 = __importDefault(require("./addEvent"));
const updateAlgoliaIndex_1 = __importDefault(require("./updateAlgoliaIndex"));
function updateStack({ id = -1, data = {}, clientId, transaction }) {
    return __awaiter(this, void 0, void 0, function* () {
        const stack = yield _Models_1.Stack.findOne({
            where: { id },
            transaction,
        });
        if (!stack) {
            throw new Error(JSON.stringify({
                status: 404,
                message: {
                    message: '未找到该进展',
                },
            }));
        }
        const stackObj = stack.get({ plain: true });
        const oldStack = stackObj;
        const changes = {};
        for (const i of ['title', 'description', 'status', 'order', 'time', 'stackEventId']) {
            if (typeof data[i] !== 'undefined' && data[i] !== stackObj[i]) {
                changes[i] = data[i];
            }
        }
        if (Object.getOwnPropertyNames(changes).length === 0) {
            return {
                status: 200,
                message: {
                    message: '什么变化也没有发生',
                    stack: stackObj,
                },
            };
        }
        const changesCopy = Object.assign({}, changes);
        if (changes.status) {
            if (changes.status === 'admitted') {
                const newsCount = yield stack.$count('news', {
                    where: { status: 'admitted' },
                    transaction,
                });
                if (newsCount === 0) {
                    throw new Error('一个进展必须在含有一个已过审新闻的情况下方可开放');
                }
            }
            stack.status = changes.status;
            stackObj.status = changes.status;
            yield stack.save({ transaction });
            yield RecordService.create({
                action: 'updateStackStatus',
                data: { status: changes.status },
                before: { status: stackObj.status },
                target: id,
                owner: clientId,
                model: 'Stack',
            }, { transaction });
        }
        delete changes.status;
        if (changes.stackEventId) {
            yield (0, addEvent_1.default)(stack.id, changes.stackEventId, clientId);
            stack.stackEventId = changes.stackEventId;
            delete changes.stackEventId;
        }
        if (Object.keys(changes).length) {
            for (const i of ['title', 'description', 'status', 'order', 'time']) {
                if (typeof changes[i] !== 'undefined') {
                    stack[i] = changes[i];
                }
            }
            yield stack.save({ transaction });
            yield RecordService.create({
                action: 'updateStackDetail',
                target: id,
                owner: clientId,
                data: changes,
                before: JSON.stringify(stackObj),
                model: 'Stack',
            }, { transaction });
        }
        setTimeout(() => {
            if (data.enableNotification && (changesCopy.status === 'admitted' ||
                (typeof changesCopy.order !== 'undefined' && stack.status === 'admitted'))) {
                NotificationService.updateStackNotifications(stack, { force: data.forceUpdate });
                NotificationService.notifyWhenStackStatusChanged(oldStack, stack, clientId);
            }
            (0, updateAlgoliaIndex_1.default)({ stackId: stack.id });
        });
        return {
            status: 201,
            message: {
                message: '修改成功',
                stack,
            },
        };
    });
}
exports.default = updateStack;

//# sourceMappingURL=updateStack.js.map
