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
const services_1 = require("~/api/services");
function changePassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = req.body;
        let salt;
        let hash;
        if (typeof data.id === 'undefined' ||
            typeof data.password === 'undefined') {
            return res.status(404).json({
                message: '参数错误',
            });
        }
        services_1.ClientService.validatePassword(data.password);
        const { clientId } = req.session;
        const targetId = data.id;
        const selfClient = req.currentClient;
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const targetClient = yield _Models_1.Client.findOne({
                where: {
                    id: targetId,
                },
                transaction,
            });
            if (typeof targetClient === 'undefined') {
                return res.status(500).json({
                    message: '找不到目标用户',
                });
            }
            if (targetId !== clientId && selfClient.isAdmin) {
                return res.status(500).json({
                    message: '您没有修改此用户密码的权限',
                });
            }
            try {
                salt = yield bcrypt.genSalt(10);
                hash = yield bcrypt.hash(data.password, salt);
            }
            catch (err) {
                req.log.error(err);
                return res.status(500).json({
                    message: '服务器发生未知错误，请联系开发者',
                });
            }
            targetClient.password = hash;
            yield targetClient.save({ transaction });
            yield services_1.RecordService.update({
                model: 'Client',
                action: 'updateClientPassword',
                client: targetId,
                target: targetId,
            }, { transaction });
            res.status(201).send({
                message: '更新密码成功',
            });
        }));
    });
}
exports.default = changePassword;

//# sourceMappingURL=changePassword.js.map
