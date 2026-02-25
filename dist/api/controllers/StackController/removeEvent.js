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
function removeEvent(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = +req.params.stackId;
        const stack = yield _Services_1.StackService.removeEvent(id, req.currentClient.id);
        if (!stack) {
            return res.status(200).json({
                message: '该进展下没有时间线',
            });
        }
        return res.status(201).json({
            message: '成功将时间线从该进展中移除',
        });
    });
}
exports.default = removeEvent;

//# sourceMappingURL=removeEvent.js.map
