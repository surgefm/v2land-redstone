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
function getInviteCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let invites = yield _Models_1.InviteCode.findAll({ where: { ownerId: req.session.clientId } });
        if ((yield _Services_1.AccessControlService.isClientEditor(req.session.clientId)) && invites.length < 5) {
            for (let i = invites.length; i < 5; i++) {
                yield _Services_1.InviteCodeService.createInviteCode(req.session.clientId);
            }
            invites = yield _Models_1.InviteCode.findAll({ where: { ownerId: req.session.clientId } });
        }
        res.status(200).json({ invites });
    });
}
exports.default = getInviteCode;

//# sourceMappingURL=getInviteCode.js.map
