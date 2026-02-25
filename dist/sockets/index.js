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
exports.loadSocket = exports.socket = void 0;
const redis_adapter_1 = require("@socket.io/redis-adapter");
const ioredis_1 = __importDefault(require("ioredis"));
const middlewares_1 = require("@Sockets/middlewares");
const RedisService_1 = require("@Services/RedisService");
const chatroom_1 = __importDefault(require("./chatroom"));
const newsroom_1 = __importDefault(require("./newsroom"));
function loadSocket(io) {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.socket)
            return exports.socket;
        if (RedisService_1.redis) {
            const pubClient = new ioredis_1.default(RedisService_1.redisConfig);
            const subClient = pubClient.duplicate();
            const key = process.env.NODE_ENV === 'production' ? 'surgefm-prod-' : process.env.REDIS_KEY || 'surgefm-dev-';
            io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient, { key }));
        }
        io.on('connection', (socket) => __awaiter(this, void 0, void 0, function* () {
            io.use(middlewares_1.isLoggedIn);
            socket.on('hey', (cb) => {
                cb('🌊');
            });
        }));
        (0, chatroom_1.default)(io);
        (0, newsroom_1.default)(io);
        exports.socket = io;
    });
}
exports.loadSocket = loadSocket;

//# sourceMappingURL=index.js.map
