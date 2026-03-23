"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const acl_1 = __importDefault(require("acl"));
const acl_sequelize_1 = __importDefault(require("acl-sequelize"));
const ioredis_1 = __importDefault(require("ioredis"));
const _Models_1 = require("@Models");
const _Configs_1 = require("@Configs");
const redisBackend_1 = __importDefault(require("./redisBackend"));
const config = _Configs_1.datastores.redis;
const useTls = process.env.REDIS_SSL !== 'false';
const redisAuth = config.password ? `${config.username}:${config.password}@` : '';
const aclRedisConfig = useTls
    ? `${useTls ? 'rediss' : 'redis'}://${redisAuth}${config.host}:${config.port}`
    : { host: config.host, port: config.port, db: config.db || 0 };
const redis = process.env.REDIS_HOST
    ? new ioredis_1.default(aclRedisConfig)
    : null;
const storageBackend = config.host
    ? new redisBackend_1.default(redis, 'surge-acl')
    : new acl_sequelize_1.default(_Models_1.sequelize, {
        prefix: 'acl_',
        defaultSchema: {
            key: { type: _Models_1.Sequelize.STRING, primaryKey: true },
            value: { type: _Models_1.Sequelize.TEXT },
        },
        schema: {
            users: {
                key: { type: _Models_1.Sequelize.INTEGER, primaryKey: true },
                value: { type: _Models_1.Sequelize.TEXT },
            },
        },
    });
const acl = new acl_1.default(storageBackend);
acl.redis = redis;
exports.default = acl;

//# sourceMappingURL=acl.js.map
