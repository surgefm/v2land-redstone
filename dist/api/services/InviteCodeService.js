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
exports.useInviteCode = exports.isValid = exports.createInviteCode = void 0;
const _Models_1 = require("@Models");
const ClientService_1 = require("./ClientService");
const UtilService_1 = require("./UtilService");
const createInviteCode = (ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    const owner = yield (0, ClientService_1.findClient)(ownerId);
    let code = `${owner.id}-${(0, UtilService_1.generateRandomAlphabetString)()}`;
    while (yield _Models_1.InviteCode.findOne({ where: { code } })) {
        code = `${owner.id}-${(0, UtilService_1.generateRandomAlphabetString)()}`;
    }
    yield _Models_1.InviteCode.create({
        ownerId: owner.id,
        code,
    });
    return code;
});
exports.createInviteCode = createInviteCode;
const isValid = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const invite = yield _Models_1.InviteCode.findOne({ where: { code } });
    if (!invite)
        return false;
    if (invite.userId)
        return false;
    return invite;
});
exports.isValid = isValid;
const useInviteCode = (code, user, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    code.userId = user.id;
    yield code.save({ transaction });
});
exports.useInviteCode = useInviteCode;

//# sourceMappingURL=InviteCodeService.js.map
