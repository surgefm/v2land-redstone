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
function getStack(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = +req.params.stackId;
        const stack = yield _Services_1.StackService.findStack(id);
        if (stack) {
            stack.contribution = yield _Services_1.StackService.getContribution({ id }, true);
            if (stack.status !== 'admitted') {
                if (req.session.clientId) {
                    if (yield _Services_1.AccessControlService.isClientEditor(req.session.clientId)) {
                        return res.status(200).json({ stack });
                    }
                }
            }
            else {
                return res.status(200).json({ stack });
            }
        }
        res.status(404).json({
            message: '该进展不存在，或尚未通过审核',
        });
    });
}
exports.default = getStack;

//# sourceMappingURL=getStack.js.map
