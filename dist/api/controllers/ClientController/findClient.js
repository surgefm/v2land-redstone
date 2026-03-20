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
function findClient(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = req.params.clientName;
        const clientId = yield _Services_1.ClientService.getClientId(name);
        const client = clientId ? yield _Services_1.ClientService.findClient(clientId, {
            withEvents: true,
            withStars: true,
            withCuratorRoles: true,
        }) : null;
        if (!client) {
            return res.status(404).json({
                message: '未找到该用户',
            });
        }
        if (req.session.clientId === client.id) {
            return res.status(200).json({ client: _Services_1.ClientService.sanitizeClient(client, true) });
        }
        else if (req.session.clientId) {
            if (yield _Services_1.AccessControlService.isClientAdmin(req.session.clientId)) {
                return res.status(200).json({ client: _Services_1.ClientService.sanitizeClient(client, true) });
            }
        }
        return res.status(200).json({
            client: _Services_1.ClientService.sanitizeClient(client),
        });
    });
}
exports.default = findClient;

//# sourceMappingURL=findClient.js.map
