"use strict";
/**
 * Session Configuration
 * (sails.config.session)
 *
 * Sails session integration leans heavily on the great work already done by
 * Express, but also unifies Socket.io with the Connect session store. It uses
 * Connect's cookie parser to normalize configuration differences between Express
 * and Socket.io and hooks into Sails' middleware interpreter to allow you to access
 * and auto-save to `req.session` with Socket.io the same way you would with Express.
 *
 * For more information on configuring the session, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.session.html
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStore = exports.sessionConfig = exports.cookie = void 0;
const parse_domain_1 = __importDefault(require("parse-domain"));
const globals_1 = __importDefault(require("./globals"));
const _Models_1 = require("@Models");
const RedisService_1 = require("@Services/RedisService");
const ioredis_1 = __importDefault(require("ioredis"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_session_sequelize_1 = __importDefault(require("connect-session-sequelize"));
let sessionStore;
exports.sessionStore = sessionStore;
const url = (0, parse_domain_1.default)(globals_1.default.api);
const cookie = {
    domain: ((process.env.NODE_ENV === 'production' || process.env.CUSTOM_DOMAIN) && url)
        ? '.langchao.org'
        : null,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
exports.cookie = cookie;
const sessionConfig = {
    secret: process.env.SESSION_SECRET || '970a14748cf639a4aa3d7b0d60cc9cac',
    resave: true,
    saveUninitialized: true,
    unset: 'destroy',
    name: 'surge.sid',
    proxy: true,
    cookie,
};
exports.sessionConfig = sessionConfig;
if (process.env.REDIS_HOST) {
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redisClient = new ioredis_1.default(RedisService_1.redisConfig);
    // redisClient.connect();
    exports.sessionStore = sessionStore = () => new RedisStore({
        client: redisClient,
        prefix: 'session:',
        ttl: 86400 * 7,
    });
    console.info('Using Redis as session storage.');
}
else {
    const SequelizeStore = (0, connect_session_sequelize_1.default)(express_session_1.default.Store);
    const store = new SequelizeStore({ db: _Models_1.sequelize });
    store.sync();
    exports.sessionStore = sessionStore = () => store;
    console.info('Using PostgreSQL as session storage. One service instance at most.');
}
exports.default = { cookie, sessionConfig, sessionStore };

//# sourceMappingURL=session.js.map
