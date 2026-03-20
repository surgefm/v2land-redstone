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
exports.getNewAccessToken = void 0;
const crypto_random_string_1 = __importDefault(require("crypto-random-string"));
const _Models_1 = require("@Models");
function getNewAccessToken(clientId, authorizationClientId, refreshable) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingActiveAccessTokens = yield _Models_1.AuthorizationAccessToken.findAll({ where: {
                owner: clientId,
                authorizationClientId,
                status: 'active',
            } });
        const token = (0, crypto_random_string_1.default)({ length: 256, type: 'url-safe' });
        const refreshToken = refreshable ? (0, crypto_random_string_1.default)({ length: 256, type: 'url-safe' }) : undefined;
        const accessToken = yield _Models_1.AuthorizationAccessToken.create({
            token,
            refreshToken,
            expire: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            owner: clientId,
            authorizationClientId,
            status: 'active',
        });
        const promises = existingActiveAccessTokens.map(token => (() => __awaiter(this, void 0, void 0, function* () {
            token.status = 'revoked';
            yield token.save();
        }))());
        yield Promise.all(promises);
        return accessToken;
    });
}
exports.getNewAccessToken = getNewAccessToken;

//# sourceMappingURL=OAuth2Service.js.map
