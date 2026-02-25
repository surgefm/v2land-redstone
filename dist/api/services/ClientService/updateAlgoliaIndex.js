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
const _Models_1 = require("@Models");
const AlgoliaService_1 = require("../AlgoliaService");
const sanitizeClient_1 = __importDefault(require("./sanitizeClient"));
function updateAlgoliaIndex({ client, clientId, transaction }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!client) {
            client = yield _Models_1.Client.findOne({
                where: { id: clientId },
                transaction,
            });
        }
        let clientObj = client;
        if (!clientObj)
            return;
        if (client.get) {
            clientObj = client.get({ plain: true });
        }
        clientObj = (0, sanitizeClient_1.default)(clientObj);
        return (0, AlgoliaService_1.updateClient)(clientObj);
    });
}
exports.default = updateAlgoliaIndex;

//# sourceMappingURL=updateAlgoliaIndex.js.map
