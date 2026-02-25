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
exports.getBotClientId = exports.getOrCreateBotClient = void 0;
const _Models_1 = require("@Models");
const ClientService = __importStar(require("../ClientService"));
const AccessControlService = __importStar(require("../AccessControlService"));
let cachedBotClientId = null;
function getOrCreateBotClient() {
    return __awaiter(this, void 0, void 0, function* () {
        if (cachedBotClientId) {
            const client = yield _Models_1.Client.findByPk(cachedBotClientId);
            if (client) {
                guardRole(client);
                return client;
            }
            cachedBotClientId = null;
        }
        let client = yield _Models_1.Client.findOne({ where: { username: 'Bot' } });
        if (!client) {
            client = yield ClientService.createClient({
                username: 'Bot',
                nickname: 'Bot',
                email: 'bot@surge.fm',
                emailVerified: true,
            });
            yield AccessControlService.allowClientToEditRole(client.id, client.id);
            yield AccessControlService.addUserRoles(client.id, AccessControlService.roles.contributors);
        }
        guardRole(client);
        cachedBotClientId = client.id;
        return client;
    });
}
exports.getOrCreateBotClient = getOrCreateBotClient;
function guardRole(client) {
    if (client.role === 'admin' || client.role === 'manager') {
        throw new Error(`Bot account has disallowed role '${client.role}'. ` +
            `The @Bot account must never be admin or manager.`);
    }
}
function getBotClientId() {
    return cachedBotClientId;
}
exports.getBotClientId = getBotClientId;

//# sourceMappingURL=botClient.js.map
