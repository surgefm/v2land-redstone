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
const _Models_1 = require("@Models");
const AccessControlService = __importStar(require("../AccessControlService"));
const InviteCodeService = __importStar(require("../InviteCodeService"));
const UtilService = __importStar(require("../UtilService"));
const RedisService = __importStar(require("../RedisService"));
const EmailService = __importStar(require("../EmailService"));
const tokenGenerator_1 = __importDefault(require("./tokenGenerator"));
const updateAlgoliaIndex_1 = __importDefault(require("./updateAlgoliaIndex"));
function createClient({ username, nickname, description, hashedPassword = '', email = '', avatar, emailVerified = false, inviteCode, }, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        let client;
        yield UtilService.execWithTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const code = inviteCode && (yield InviteCodeService.isValid(inviteCode));
            const role = inviteCode ? 'editor' : 'contributor';
            client = yield _Models_1.Client.create({
                username,
                nickname: nickname || username,
                description,
                password: hashedPassword,
                avatar,
                email,
                emailVerified,
                role,
            }, {
                raw: true,
                transaction,
            });
            if (code) {
                yield InviteCodeService.useInviteCode(code, client, transaction);
            }
            yield AccessControlService.allowClientToEditRole(client.id, client.id);
            yield AccessControlService.addUserRoles(client.id, role === 'editor'
                ? AccessControlService.roles.editors
                : AccessControlService.roles.contributors);
            yield _Models_1.Record.create({
                model: 'Client',
                operation: 'create',
                data: client,
                target: client.id,
                action: 'createClient',
            }, { transaction });
            if (!emailVerified) {
                const verificationToken = (0, tokenGenerator_1.default)();
                yield _Models_1.Record.create({
                    model: 'Miscellaneous',
                    operation: 'create',
                    data: {
                        clientId: client.id,
                        verificationToken,
                        expire: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
                    },
                    target: client.id,
                    action: 'createClientVerificationToken',
                }, { transaction });
                EmailService.register(client, verificationToken);
            }
        }), transaction);
        (0, updateAlgoliaIndex_1.default)({ clientId: client.id, transaction });
        yield RedisService.set(RedisService.getClientIdKey(client.username), client.id);
        return client;
    });
}
exports.default = createClient;

//# sourceMappingURL=createClient.js.map
