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
const sequelize_1 = require("sequelize");
const StarService = __importStar(require("@Services/StarService"));
const getEventsClientContributedTo_1 = __importDefault(require("./getEventsClientContributedTo"));
function findClient(clientName, { transaction, withAuths = true, withSubscriptions = true, withEvents = false, withStars = false, withPassword = false, forceUpdate = false, withCuratorRoles = false, } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (clientName instanceof _Models_1.Client) {
            if (forceUpdate) {
                clientName = clientName.id;
            }
            else {
                return clientName;
            }
        }
        let where;
        if (+clientName > 0) {
            where = {
                id: +clientName,
            };
        }
        else if (typeof clientName === 'string') {
            clientName = clientName.trim();
            where = {
                [sequelize_1.Op.or]: [
                    { username: { [sequelize_1.Op.iLike]: clientName } },
                    { email: { [sequelize_1.Op.iLike]: clientName } },
                ],
            };
        }
        const include = [];
        if (withAuths) {
            include.push({
                as: 'auths',
                model: _Models_1.Auth,
                where: {
                    profileId: { [sequelize_1.Op.not]: null },
                },
                attributes: ['id', 'site', 'profileId', 'profile'],
                required: false,
            });
        }
        if (withSubscriptions) {
            include.push({
                as: 'subscriptions',
                model: _Models_1.Subscription,
                where: { status: 'active' },
                order: [['createdAt', 'DESC']],
                required: false,
                include: [{
                        model: _Models_1.Contact,
                        where: { status: 'active' },
                    }],
            });
        }
        const client = yield _Models_1.Client.findOne({
            where,
            attributes: { exclude: withPassword ? [] : ['password'] },
            include,
            transaction,
        });
        if (withEvents) {
            client.events = yield (0, getEventsClientContributedTo_1.default)(client.id);
        }
        if (withStars) {
            client.stars = yield StarService.getClientStars(client.id);
        }
        if (withCuratorRoles) {
            client.curatorRoles = yield _Models_1.TagCurator.findAll({
                where: {
                    curatorId: client.id,
                },
            });
        }
        return client;
    });
}
exports.default = findClient;

//# sourceMappingURL=findClient.js.map
