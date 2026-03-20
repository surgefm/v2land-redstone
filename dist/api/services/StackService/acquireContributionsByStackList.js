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
const getContribution_1 = __importDefault(require("./getContribution"));
function acquireContributionsByStackList(stackList) {
    return __awaiter(this, void 0, void 0, function* () {
        const queue = [];
        const getContributionFn = (stack) => __awaiter(this, void 0, void 0, function* () {
            stack.contribution = yield (0, getContribution_1.default)(stack);
        });
        for (const stack of stackList) {
            queue.push(getContributionFn(stack));
        }
        yield Promise.all(queue);
        return stackList;
    });
}
exports.default = acquireContributionsByStackList;

//# sourceMappingURL=acquireContributionsByStackList.js.map
