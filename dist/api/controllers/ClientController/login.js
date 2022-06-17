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
const _Services_1 = require("@Services");
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = req.body;
        const client = yield _Services_1.ClientService.findClient(data.username, {
            withAuths: false,
            withSubscriptions: false,
            withPassword: true,
        });
        if (!client) {
            return res.status(404).json({
                message: '未找到该用户',
            });
        }
        const verified = yield bcrypt.compare(data.password, client.password);
        if (!verified) {
            return res.status(401).json({
                message: '错误的用户名、邮箱或密码',
            });
        }
        req.session.clientId = client.id;
        const clientObj = client.get({ plain: true });
        delete clientObj.password;
        res.status(200).json({
            message: '登录成功',
            client: clientObj,
        });
    });
}
exports.default = login;

//# sourceMappingURL=login.js.map
