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
function inviteCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const invite = yield _Services_1.InviteCodeService.isValid(req.query && req.query.inviteCode);
        if (invite) {
            return res.status(200).json({ invite });
        }
        else {
            return res.status(400).json({ message: 'Invalid code.' });
        }
    });
}
exports.default = inviteCode;

//# sourceMappingURL=inviteCode.js.map
