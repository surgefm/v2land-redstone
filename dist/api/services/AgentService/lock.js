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
exports.shouldStop = exports.requestStop = exports.drainInbox = exports.pushToInbox = exports.isLocked = exports.refreshLock = exports.releaseLock = exports.acquireLock = void 0;
const RedisService = __importStar(require("../RedisService"));
const LOCK_TTL = 300; // 5 minutes
function lockKey(eventId) {
    return `agent-lock:${eventId}`;
}
function inboxKey(eventId) {
    return `agent-inbox:${eventId}`;
}
function stopKey(eventId) {
    return `agent-stop:${eventId}`;
}
function acquireLock(eventId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!RedisService.redis)
            return false;
        const key = ((_a = RedisService.redis.options) === null || _a === void 0 ? void 0 : _a.keyPrefix)
            ? lockKey(eventId)
            : lockKey(eventId);
        const result = yield RedisService.redis.set(key, JSON.stringify({ startedAt: new Date().toISOString(), status: 'running' }), 'EX', LOCK_TTL, 'NX');
        return result === 'OK';
    });
}
exports.acquireLock = acquireLock;
function releaseLock(eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!RedisService.redis)
            return;
        yield Promise.all([
            RedisService.redis.del(lockKey(eventId)),
            RedisService.redis.del(inboxKey(eventId)),
            RedisService.redis.del(stopKey(eventId)),
        ]);
    });
}
exports.releaseLock = releaseLock;
function refreshLock(eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!RedisService.redis)
            return;
        yield RedisService.redis.expire(lockKey(eventId), LOCK_TTL);
    });
}
exports.refreshLock = refreshLock;
function isLocked(eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!RedisService.redis)
            return false;
        const val = yield RedisService.redis.get(lockKey(eventId));
        return val !== null;
    });
}
exports.isLocked = isLocked;
function pushToInbox(eventId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!RedisService.redis)
            return;
        yield RedisService.redis.rpush(inboxKey(eventId), message);
        yield RedisService.redis.expire(inboxKey(eventId), LOCK_TTL);
    });
}
exports.pushToInbox = pushToInbox;
function drainInbox(eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!RedisService.redis)
            return [];
        const messages = [];
        while (true) {
            const msg = yield RedisService.redis.lpop(inboxKey(eventId));
            if (!msg)
                break;
            messages.push(msg);
        }
        return messages;
    });
}
exports.drainInbox = drainInbox;
function requestStop(eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!RedisService.redis)
            return;
        yield RedisService.redis.set(stopKey(eventId), '1', 'EX', LOCK_TTL);
    });
}
exports.requestStop = requestStop;
function shouldStop(eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!RedisService.redis)
            return false;
        const val = yield RedisService.redis.get(stopKey(eventId));
        return val !== null;
    });
}
exports.shouldStop = shouldStop;

//# sourceMappingURL=lock.js.map
