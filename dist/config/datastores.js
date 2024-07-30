"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.postgresql = void 0;
exports.postgresql = {
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PWD,
    database: process.env.POSTGRES_DB || 'v2land',
    port: +process.env.POSTGRES_PORT || 5432,
};
exports.redis = process.env.REDIS_HOST ? {
    db: +process.env.REDIS_DB || 0,
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: +process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PWD,
    prefix: process.env.REDIS_PREFIX || 'surge-',
    username: process.env.REDIS_USERNAME || 'default',
} : {};
exports.default = { postgresql: exports.postgresql, redis: exports.redis };

//# sourceMappingURL=datastores.js.map
