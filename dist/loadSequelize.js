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
exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const datastores_1 = __importDefault(require("@Configs/datastores"));
const models = __importStar(require("@Models"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
const { postgresql } = datastores_1.default;
let logging = process.env.SEQUELIZE_LOGGING !== 'false';
if (logging && process.env.NODE_ENV === 'production') {
    logging = (sql) => {
        logger.info(sql);
    };
}
else if (logging) {
    logging = (sql) => {
        console.info(sql);
    };
}
const useSSL = process.env.POSTGRES_SSL !== 'false';
exports.sequelize = new sequelize_typescript_1.Sequelize({
    database: postgresql.database,
    dialect: 'postgres',
    username: postgresql.user,
    password: postgresql.password,
    host: postgresql.host,
    port: postgresql.port,
    modelPaths: Object.keys(models).map(model => models[model]).filter(x => x),
    native: useSSL,
    ssl: useSSL,
    pool: {
        max: 22,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    logging,
});
function loadSequelize() {
    return __awaiter(this, void 0, void 0, function* () {
        yield exports.sequelize.authenticate();
        yield exports.sequelize.sync();
    });
}
exports.default = loadSequelize;

//# sourceMappingURL=loadSequelize.js.map
