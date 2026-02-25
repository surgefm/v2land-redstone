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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
const lodash_1 = __importDefault(require("lodash"));
function updateMultipleStacks(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { stackList } = req.body;
        if (!lodash_1.default.isArray(stackList) || stackList.length === 0) {
            return res.status(400).json({
                message: '错误的输入参数：stackList',
            });
        }
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const queue = stackList.map(stack => _Services_1.StackService.updateStack({
                id: stack.id,
                data: stack,
                clientId: req.session.clientId,
                transaction,
            }));
            yield Promise.all(queue);
            const updateOrder = stackList.filter(s => s.order !== undefined).length === stackList.length;
            const stack = yield _Models_1.Stack.findByPk(stackList[0].id);
            if (updateOrder) {
                yield _Services_1.RecordService.update({
                    model: 'Event',
                    target: stack.eventId,
                    owner: req.session.clientId,
                    action: 'updateStackOrders',
                }, { transaction });
            }
            return res.status(201).json({
                message: '修改成功',
            });
        }));
    });
}
exports.default = updateMultipleStacks;

//# sourceMappingURL=updateMultipleStacks.js.map
