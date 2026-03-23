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
exports.decr = exports.incr = exports.rpop = exports.lpop = exports.lrange = exports.rpush = exports.lpush = exports.hlen = exports.hdel = exports.hset = exports.hgetall = exports.hget = exports.mget = exports.expire = exports.del = exports.set = exports.get = exports.getSubscriptionCacheKey = exports.getEventIdKey = exports.getClientIdKey = exports.redis = exports.classicRedis = exports.redisConfig = exports.redisUrl = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const _Configs_1 = require("@Configs");
const config = _Configs_1.datastores.redis;
const useTls = process.env.REDIS_SSL !== 'false';
const redisAuth = config.password ? `${config.username}:${config.password}@` : '';
exports.redisUrl = `${useTls ? 'rediss' : 'redis'}://${redisAuth}${config.host}:${config.port}`;
exports.redisConfig = useTls
    ? exports.redisUrl
    : { host: config.host, port: config.port, db: config.db || 0 };
exports.classicRedis = process.env.REDIS_HOST ? new ioredis_1.default(exports.redisConfig) : null;
exports.redis = exports.classicRedis;
function getClientIdKey(clientName) {
    return `client-name-mem-${(clientName || '').toLowerCase()}`;
}
exports.getClientIdKey = getClientIdKey;
function getEventIdKey(eventName, clientName) {
    return `event-name-mem-${eventName}@${(clientName + '').toLowerCase()}`;
}
exports.getEventIdKey = getEventIdKey;
function getSubscriptionCacheKey(eventId) {
    return `event-subscription-mem-${eventId}`;
}
exports.getSubscriptionCacheKey = getSubscriptionCacheKey;
function get(key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        const data = yield exports.redis.get(_Configs_1.datastores.redis.prefix + key);
        if (!data)
            return;
        return JSON.parse(data);
    });
}
exports.get = get;
function set(key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        return exports.redis.set(_Configs_1.datastores.redis.prefix + key, JSON.stringify(value));
    });
}
exports.set = set;
function del(key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        return exports.redis.del(_Configs_1.datastores.redis.prefix + key);
    });
}
exports.del = del;
function expire(key, seconds) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        return exports.redis.expire(_Configs_1.datastores.redis.prefix + key, seconds);
    });
}
exports.expire = expire;
function mget(...keys) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        if (keys.length === 0)
            return [];
        keys = keys.map(key => (_Configs_1.datastores.redis.prefix + key));
        const data = yield exports.redis.mget(keys);
        return data.map(d => d ? JSON.parse(d) : null);
    });
}
exports.mget = mget;
function hget(key, field) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        const data = yield exports.redis.hget(_Configs_1.datastores.redis.prefix + key, field);
        if (!data)
            return;
        return JSON.parse(data);
    });
}
exports.hget = hget;
function hgetall(key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        const data = yield exports.redis.hgetall(_Configs_1.datastores.redis.prefix + key);
        if (!data)
            return;
        const ret = {};
        const keys = Object.keys(data);
        for (const key of keys) {
            ret[key] = JSON.parse(data[key]);
        }
        return ret;
    });
}
exports.hgetall = hgetall;
function hset(key, field, value) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        return exports.redis.hset(_Configs_1.datastores.redis.prefix + key, field, JSON.stringify(value));
    });
}
exports.hset = hset;
function hdel(key, field) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        return exports.redis.hdel(_Configs_1.datastores.redis.prefix + key, field);
    });
}
exports.hdel = hdel;
function hlen(key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        return exports.redis.hlen(_Configs_1.datastores.redis.prefix + key);
    });
}
exports.hlen = hlen;
function lpush(key, ...values) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        return exports.redis.lpush(_Configs_1.datastores.redis.prefix + key, ...values.map(value => JSON.stringify(value)));
    });
}
exports.lpush = lpush;
function rpush(key, ...values) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        return exports.redis.rpush(_Configs_1.datastores.redis.prefix + key, ...values.map(value => JSON.stringify(value)));
    });
}
exports.rpush = rpush;
function lrange(key, start = 0, end = -1) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return [];
        return exports.redis.lrange(_Configs_1.datastores.redis.prefix + key, start, end);
    });
}
exports.lrange = lrange;
function lpop(key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        const result = yield exports.redis.lpop(_Configs_1.datastores.redis.prefix + key);
        if (!result)
            return result;
        return JSON.parse(result);
    });
}
exports.lpop = lpop;
function rpop(key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        const result = yield exports.redis.rpop(_Configs_1.datastores.redis.prefix + key);
        if (!result)
            return result;
        return JSON.parse(result);
    });
}
exports.rpop = rpop;
function incr(key, by = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        const result = yield exports.redis.incrby(_Configs_1.datastores.redis.prefix + key, by);
        return result;
    });
}
exports.incr = incr;
function decr(key, by = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.redis)
            return;
        const result = yield exports.redis.decrby(_Configs_1.datastores.redis.prefix + key, by);
        return result;
    });
}
exports.decr = decr;

//# sourceMappingURL=RedisService.js.map
