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
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
function getStackList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let where;
        let isManager = false;
        if (req.body && req.body.where) {
            where = req.body.where;
        }
        if (where && req.session.clientId) {
            if (yield _Services_1.AccessControlService.isClientEditor(req.session.clientId)) {
                isManager = true;
            }
        }
        if (where && !isManager) {
            where.status = 'admitted';
        }
        if (where) {
            where = _Services_1.UtilService.convertWhereQuery(where);
        }
        const stacks = yield _Models_1.Stack.findAll({
            where: where || {
                status: 'admitted',
            },
            include: [{
                    model: _Models_1.News,
                    as: 'news',
                    where: { status: 'admitted' },
                    order: [['time', 'ASC']],
                    through: { attributes: [] },
                    required: false,
                }],
            order: [['updatedAt', 'DESC']],
        });
        const stackObjs = stacks.map(() => null);
        const getDetail = (i) => __awaiter(this, void 0, void 0, function* () {
            const stack = stacks[i];
            const stackObj = stack.get({ plain: true });
            if (!stack.time && stack.status === 'admitted' && stack.news && stack.news.length) {
                stackObj.time = stack.news[0].time;
            }
            stackObj.newsCount = yield _Models_1.News.count({
                where: {
                    status: 'admitted',
                    stackId: stack.id,
                },
            });
            stackObjs[i] = stackObj;
        });
        const queue = [];
        for (let i = 0; i < stacks.length; i++) {
            queue.push(getDetail(i));
        }
        yield Promise.all(queue);
        yield _Services_1.StackService.acquireContributionsByStackList(stackObjs);
        res.status(200).json({
            stackList: stackObjs,
        });
    });
}
exports.default = getStackList;

//# sourceMappingURL=getStackList.js.map
