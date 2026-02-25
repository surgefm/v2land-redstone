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
exports.socket = exports.app = exports.liftServer = void 0;
require("source-map-support/register");
require("module-alias/register");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const response_time_1 = __importDefault(require("response-time"));
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const express_pino_logger_1 = __importDefault(require("express-pino-logger"));
const express_session_1 = __importDefault(require("express-session"));
const session_1 = require("@Configs/session");
const http_2 = __importDefault(require("@Configs/http"));
const cors_1 = __importDefault(require("cors"));
const security_1 = __importDefault(require("@Configs/security"));
const loadRoutes_1 = __importDefault(require("./loadRoutes"));
const loadSequelize_1 = __importDefault(require("./loadSequelize"));
const initialize_1 = __importDefault(require("@Services/AccessControlService/initialize"));
const sockets_1 = require("./sockets");
const _Responses_1 = require("@Responses");
const oauth_1 = require("./api/oauth");
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
const socket = new socket_io_1.Server(server, {
    cors: security_1.default.cors,
    cookie: {
        name: 'redstone.sid',
        httpOnly: false,
    },
});
exports.socket = socket;
function liftServer(app) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, loadSequelize_1.default)();
        if (process.env.NODE_ENV === 'production') {
            app.use((0, express_pino_logger_1.default)());
        }
        app.use((0, response_time_1.default)());
        // app.use(favicon(path.join(__dirname, 'assets/favicon.ico')));
        app.use((0, cors_1.default)(security_1.default.cors));
        app.use(body_parser_1.default.json());
        app.use(body_parser_1.default.urlencoded({ extended: false }));
        app.use((0, compression_1.default)());
        const sess = (0, express_session_1.default)(Object.assign(Object.assign({}, session_1.sessionConfig), { store: (0, session_1.sessionStore)() }));
        app.use(sess);
        app.use(http_2.default.middleware.bearerAuthentication);
        app.use(http_2.default.middleware.noCache);
        // Mount OAuth2 endpoints (metadata, registration, authorize) after session
        (0, oauth_1.mountOAuth)(app);
        (0, loadRoutes_1.default)(app);
        yield (0, initialize_1.default)();
        // Initialize @Bot account and mount MCP server
        try {
            const { getOrCreateBotClient } = yield Promise.resolve().then(() => __importStar(require('@Services/AgentService')));
            const botClient = yield getOrCreateBotClient();
            console.log('@Bot account initialized');
            const { mountMcp } = yield Promise.resolve().then(() => __importStar(require('./api/mcp')));
            mountMcp(app, botClient.id);
        }
        catch (err) {
            console.error('Failed to initialize @Bot account or MCP server:', err);
        }
        app.use(_Responses_1.errorHandler);
        yield (0, sockets_1.loadSocket)(socket);
        if (process.env.NODE_ENV !== 'test') {
            server.listen(1337, () => {
                console.log('V2land Redstone started');
            });
        }
    });
}
exports.liftServer = liftServer;
if (process.env.NODE_ENV !== 'test') {
    liftServer(app);
}
exports.default = app;

//# sourceMappingURL=app.js.map
