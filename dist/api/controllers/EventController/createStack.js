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
function createStack(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = req.params.eventName;
        const eventId = yield _Services_1.EventService.getEventId(name);
        const data = req.body;
        const stack = yield _Services_1.StackService.createStack(eventId, data, req.session.clientId);
        res.status(201).json({
            message: '提交成功，该进展在社区管理员审核通过后将很快开放',
            stack,
        });
    });
}
exports.default = createStack;

//# sourceMappingURL=createStack.js.map
