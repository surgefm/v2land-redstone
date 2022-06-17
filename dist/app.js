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
const serve_favicon_1 = __importDefault(require("serve-favicon"));
const path_1 = __importDefault(require("path"));
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
        app.use((0, serve_favicon_1.default)(path_1.default.join(__dirname, 'assets/favicon.ico')));
        app.use((0, cors_1.default)(security_1.default.cors));
        app.use(body_parser_1.default.json());
        app.use((0, compression_1.default)());
        const sess = (0, express_session_1.default)(Object.assign(Object.assign({}, session_1.sessionConfig), { store: (0, session_1.sessionStore)() }));
        app.use(sess);
        app.use(http_2.default.middleware.bearerAuthentication);
        app.use(http_2.default.middleware.noCache);
        (0, loadRoutes_1.default)(app);
        yield (0, initialize_1.default)();
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
