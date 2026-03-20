"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const bcrypt = __importStar(require("bcrypt"));
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = req.body;
        let salt;
        let hash;
        if (!data.username || !data.email || !data.password || !data.nickname) {
            return res.status(400).json({
                message: '缺少参数：username，email，nickname 或 password。',
            });
        }
        _Services_1.ClientService.validatePassword(data.password);
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            let client = yield _Services_1.ClientService.findClient(data.username, {
                withAuths: false,
                withSubscriptions: false,
            });
            client = client || (yield _Services_1.ClientService.findClient(data.email, {
                withAuths: false,
                withSubscriptions: false,
            }));
            if (client) {
                const message = client.username === data.username
                    ? '该用户名已被占用'
                    : '该邮箱已被占用';
                return res.status(406).json({ message });
            }
            try {
                salt = yield bcrypt.genSalt(10);
                hash = yield bcrypt.hash(data.password, salt);
            }
            catch (err) {
                return res.status(500).json({
                    message: 'Error occurs when generating hash',
                });
            }
            client = yield _Services_1.ClientService.createClient({
                username: data.username,
                nickname: data.nickname,
                hashedPassword: hash,
                email: data.email,
                inviteCode: data.inviteCode,
            }, transaction);
            req.session.clientId = client.id;
            const clientObj = client.get({ plain: true });
            delete clientObj.password;
            res.status(201).json({
                message: '注册成功，请在三天内至邮箱查收验证邮件',
                client: clientObj,
            });
        }));
    });
}
exports.default = register;

//# sourceMappingURL=register.js.map
