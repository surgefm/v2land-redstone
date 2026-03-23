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
const roles_1 = require("./roles");
const operations_1 = require("./operations");
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        // Define guests’ permission
        yield (0, operations_1.allow)(roles_1.guests, ['events', 'stacks', 'news'], 'view');
        // Define contributors’ permission
        yield (0, operations_1.addRoleParents)(roles_1.contributors, roles_1.guests);
        yield (0, operations_1.allow)(roles_1.contributors, 'events', ['create', 'edit', 'publish', 'delete']);
        yield (0, operations_1.allow)(roles_1.contributors, 'stacks', ['create', 'edit', 'delete']);
        yield (0, operations_1.allow)(roles_1.contributors, 'news', ['create', 'delete']);
        // Define editors’ permission
        yield (0, operations_1.addRoleParents)(roles_1.editors, roles_1.contributors);
        yield (0, operations_1.allow)(roles_1.editors, 'headlines', '*');
        yield (0, operations_1.allow)(roles_1.editors, 'news', ['edit']);
        yield (0, operations_1.allow)(roles_1.editors, 'all-admitted-events', ['view', 'edit']);
        yield (0, operations_1.removeAllow)(roles_1.editors, 'all-events', ['view', 'edit']);
        // Define managers’ permission
        yield (0, operations_1.addRoleParents)(roles_1.managers, roles_1.editors);
        yield (0, operations_1.allow)(roles_1.managers, 'all-tags', '*');
        yield (0, operations_1.allow)(roles_1.managers, 'all-events', ['view', 'edit']);
        // Define admins’ permission
        yield (0, operations_1.addRoleParents)(roles_1.admins, roles_1.editors);
        yield (0, operations_1.allow)(roles_1.admins, 'no-admin-roles', ['view', 'create', 'edit', 'delete']);
        yield (0, operations_1.allow)(roles_1.admins, 'admin-roles', 'view');
        // const clients = await Client.findAll();
        // for (const client of clients) {
        //   if (client.role === 'admin') {
        //     await addUserRoles(client.id, admins);
        //   } else if (client.role === 'manager') {
        //     await addUserRoles(client.id, managers);
        //   } else if (client.role === 'editor') {
        //     await addUserRoles(client.id, editors);
        //   } else {
        //     await addUserRoles(client.id, contributors);
        //   }
        // }
    });
}
exports.default = initialize;

//# sourceMappingURL=initialize.js.map
