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
function getClientDetail(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const clientId = req.session.clientId;
        if (!clientId) {
            return res.status(401).json({
                message: '你还未登录',
            });
        }
        const client = yield _Services_1.ClientService.findClient(clientId, {
            withStars: true,
            withCuratorRoles: true,
        });
        if (!client) {
            delete req.session.clientId;
            return res.status(404).json({
                message: '未找到该用户',
            });
        }
        res.status(200).json({ client: _Services_1.ClientService.sanitizeClient(client, true) });
    });
}
exports.default = getClientDetail;

//# sourceMappingURL=getClientDetail.js.map
