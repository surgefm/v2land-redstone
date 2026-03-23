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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * isLoggedIn
 *
 * @module      :: Policy
 * @description :: Check if the session client has logged in
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
function default_1(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof req.session === 'undefined') {
            return res.status(401).json({
                message: '请在登录后进行该操作',
            });
        }
        req.currentClient = yield getClient(req, req.session.clientId);
        if (req.currentClient) {
            req.currentClient.isAdmin = yield _Services_1.AccessControlService.isClientAdmin(req.session.clientId);
            req.currentClient.isEditor = req.currentClient.isAdmin || (yield _Services_1.AccessControlService.isClientEditor(req.session.clientId));
            req.currentClient.isManager = req.currentClient.isManager || (yield _Services_1.AccessControlService.isClientManager(req.session.clientId));
            return next();
        }
        else {
            return res.status(401).json({
                message: '请在登录后进行该操作',
            });
        }
    });
}
exports.default = default_1;
/**
 * getClient
 *
 * @module      :: Policy
 * @description :: Check if the clientId is undefined or invalid; if valid, return a client instance
 * @returns     :: a client instance(if client's found) or false (if not found)
 */
function getClient(req, clientId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!clientId) {
            return null;
        }
        const client = yield _Models_1.Client.findByPk(clientId);
        if (!client) {
            delete req.session.clientId;
            return null;
        }
        return client;
    });
}

//# sourceMappingURL=isLoggedIn.js.map
