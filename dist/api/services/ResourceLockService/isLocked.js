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
const RedisService = __importStar(require("@Services/RedisService"));
const _Models_1 = require("@Models");
const _Types_1 = require("@Types");
const getRedisResourceLockKey_1 = __importDefault(require("./getRedisResourceLockKey"));
function isLocked(model, resourceId, clientId) {
    return __awaiter(this, void 0, void 0, function* () {
        const lock = RedisService.redis
            ? yield RedisService.get((0, getRedisResourceLockKey_1.default)(model, resourceId))
            : yield _Models_1.ResourceLock.findOne({
                where: {
                    model,
                    resourceId,
                    status: _Types_1.ResourceLockStatus.ACTIVE,
                    expires: { [_Models_1.Sequelize.Op.lt]: Date.now() },
                },
                attributes: ['locker'],
            });
        if (!lock)
            return false;
        if (clientId && lock.locker === clientId)
            return false;
        return true;
    });
}
exports.default = isLocked;

//# sourceMappingURL=isLocked.js.map
