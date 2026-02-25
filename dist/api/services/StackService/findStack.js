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
const getContribution_1 = __importDefault(require("./getContribution"));
function findStack(id, withContributionData = true, { transaction } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const stack = yield _Models_1.Stack.findByPk(id, {
            include: [{
                    model: _Models_1.News,
                    as: 'news',
                    where: { status: 'admitted' },
                    order: [['time', 'ASC']],
                    through: { attributes: [] },
                    required: false,
                    include: [{
                            model: _Models_1.Site,
                            as: 'site',
                            required: false,
                        }, {
                            model: _Models_1.SiteAccount,
                            as: 'siteAccount',
                            required: false,
                        }],
                }, {
                    model: _Models_1.Event,
                    as: 'stackEvent',
                    where: { status: 'admitted' },
                    required: false,
                }],
            transaction,
        });
        if (!stack)
            return;
        const stackObj = stack.get({ plain: true });
        stackObj.newsCount = yield stack.$count('news', {
            where: { status: 'admitted' },
            transaction,
        });
        if (!stack.time && stack.news && stack.news.length) {
            stackObj.time = stack.news[0].time;
        }
        stackObj.contribution = yield (0, getContribution_1.default)(stack, withContributionData);
        return stackObj;
    });
}
exports.default = findStack;

//# sourceMappingURL=findStack.js.map
