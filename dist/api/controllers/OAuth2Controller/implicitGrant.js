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
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
const isLoggedIn_1 = __importDefault(require("@Policies/isLoggedIn"));
function implicitGrant(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, isLoggedIn_1.default)(req, res, () => granting(req, res));
    });
}
function granting(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const authorizationClientId = req.query.authorizationClientId;
        const clientId = req.session.clientId;
        const authorizationClient = yield _Models_1.AuthorizationClient.findOne({ where: { id: authorizationClientId } });
        if (authorizationClient == null) {
            return res.status(404).json({
                message: '未找到该客户端',
            });
        }
        const accessToken = yield _Services_1.OAuth2Service.getNewAccessToken(clientId, parseInt(authorizationClientId), true);
        return res.status(201).json({
            message: '操作成功',
            accessToken,
        });
    });
}
exports.default = implicitGrant;

//# sourceMappingURL=implicitGrant.js.map
