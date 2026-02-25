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
const operations_1 = require("../operations");
const roles_1 = require("../roles");
function isClientManager(clientId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield (0, operations_1.hasRole)(clientId, roles_1.admins))
            return true;
        return (0, operations_1.hasRole)(clientId, roles_1.managers);
    });
}
exports.default = isClientManager;

//# sourceMappingURL=isClientManager.js.map
