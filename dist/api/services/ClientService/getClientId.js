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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _Models_1 = require("@Models");
const RedisService = __importStar(require("@Services/RedisService"));
const lodash_1 = __importDefault(require("lodash"));
function getClientId(clientName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof clientName === 'number')
            return clientName;
        if (!lodash_1.default.isNaN(+clientName))
            return +clientName;
        const redisKey = RedisService.getClientIdKey(clientName);
        const redisRes = yield RedisService.get(redisKey);
        if (redisRes)
            return redisRes;
        const client = yield _Models_1.Client.findOne({
            attributes: ['id'],
            where: {
                username: {
                    [_Models_1.Sequelize.Op.iLike]: clientName,
                },
            },
        });
        if (!client)
            return null;
        yield RedisService.set(redisKey, client.id);
        return client.id;
    });
}
exports.default = getClientId;

//# sourceMappingURL=getClientId.js.map
