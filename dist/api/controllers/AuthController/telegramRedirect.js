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
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable camelcase */
const crypto_1 = __importDefault(require("crypto"));
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
const TelegramService_1 = require("@Services/TelegramService");
function telegramRedirect(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!TelegramService_1.TELE_TOKEN) {
            return res.status(503).json({
                message: '暂不支持 Telegram 绑定',
            });
        }
        if (!(req.query && req.query.res)) {
            return res.status(400).json({
                message: '请求缺少 res',
            });
        }
        const r = JSON.parse(decodeURIComponent(req.query.res));
        const { first_name, last_name, id, photo_url, username, hash } = r;
        const dataCheckString = Object.keys(r).filter(r => r !== 'hash').sort().map(k => `${k}=${r[k]}`).join('\n');
        const secretKey = crypto_1.default.createHash('sha256').update(TelegramService_1.TELE_TOKEN).digest();
        const hashed = crypto_1.default.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
        if (hashed !== hash) {
            return res.status(404).json({
                message: 'hash 错误',
            });
        }
        const existingAuth = yield _Models_1.Auth.findOne({
            where: {
                profileId: `${id}`,
                site: 'telegram',
            },
        });
        if (existingAuth) {
            existingAuth.profile = r;
            if (existingAuth.owner) {
                yield existingAuth.save();
                req.session.clientId = existingAuth.owner;
                return res.status(200).json(_Services_1.AuthService.sanitize(existingAuth));
            }
            else if (req.session.clientId) {
                existingAuth.owner = req.body.clientId;
                yield existingAuth.save();
                yield _Services_1.RecordService.create({
                    model: 'auth',
                    action: 'authorizeThirdPartyAccount',
                    owner: req.session.clientId,
                    target: existingAuth.id,
                });
                return res.status(201).json(_Services_1.AuthService.sanitize(existingAuth));
            }
        }
        let avatar;
        if (_Services_1.UploadService.hasS3 && photo_url) {
            avatar = yield _Services_1.UploadService.uploadFromUrl(photo_url, '.jpg');
        }
        const clientUsername = yield _Services_1.ClientService.randomlyGenerateUsername(username);
        const newClient = yield _Services_1.ClientService.createClient({
            username: clientUsername,
            nickname: `${first_name} ${last_name}`,
            avatar,
            inviteCode: req.query.inviteCode || '',
        });
        const auth = existingAuth || (yield _Models_1.Auth.create({
            site: 'telegram',
            profileId: `${id}`,
            profile: r,
        }));
        auth.owner = newClient.id;
        yield auth.save();
        req.session.clientId = newClient.id;
        return res.status(201).json({
            message: '注册成功',
            auth: _Services_1.AuthService.sanitize(auth),
            client: newClient,
        });
    });
}
exports.default = telegramRedirect;

//# sourceMappingURL=telegramRedirect.js.map
