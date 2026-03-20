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
function loadChatMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const clientId = req.session.clientId;
        const type = req.body.type;
        const ids = req.body.ids;
        const hasAccess = type === 'client'
            ? yield _Services_1.AccessControlService.isAllowedToViewClientChat(clientId, ids)
            : yield _Services_1.AccessControlService.isAllowedToViewNewsroomChat(clientId, ids);
        if (!hasAccess) {
            return res.status(401).json({
                message: '你没有权限浏览该聊天',
            });
        }
        const messages = yield _Services_1.ChatService.loadMessages(type, ids, { before: req.body.before });
        res.status(200).json({ messages });
    });
}
exports.default = loadChatMessages;

//# sourceMappingURL=loadChatMessages.js.map
