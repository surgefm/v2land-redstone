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
/* eslint-disable no-invalid-this */
const assert_1 = __importDefault(require("assert"));
const _Services_1 = require("@Services");
const removeAllRoles = (clientId) => __awaiter(void 0, void 0, void 0, function* () {
    return _Services_1.AccessControlService.removeUserRoles(clientId, yield _Services_1.AccessControlService.userRoles(clientId));
});
describe('AccessControlService', () => {
    it('should initialize', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield _Services_1.AccessControlService.initialize();
        });
    });
    it('should allow contributors to create event', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield removeAllRoles(-1);
            yield _Services_1.AccessControlService.addUserRoles(-1, _Services_1.AccessControlService.roles.contributors);
            const isAllowed = yield _Services_1.AccessControlService.isAllowed(-1, 'events', 'create');
            (0, assert_1.default)(isAllowed === true);
        });
    });
    it('should allow editors to create event', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield removeAllRoles(-1);
            yield _Services_1.AccessControlService.addUserRoles(-1, _Services_1.AccessControlService.roles.editors);
            const isAllowed = yield _Services_1.AccessControlService.isAllowed(-1, 'events', 'create');
            (0, assert_1.default)(isAllowed === true);
        });
    });
    it('should allow admins to create event', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield removeAllRoles(-1);
            yield _Services_1.AccessControlService.addUserRoles(-1, _Services_1.AccessControlService.roles.admins);
            const isAllowed = yield _Services_1.AccessControlService.isAllowed(-1, 'events', 'create');
            (0, assert_1.default)(isAllowed === true);
        });
    });
    it('should not allow guests to create event', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield removeAllRoles(-1);
            yield _Services_1.AccessControlService.addUserRoles(-1, _Services_1.AccessControlService.roles.guests);
            const isAllowed = yield _Services_1.AccessControlService.isAllowed(-1, 'events', 'create');
            (0, assert_1.default)(isAllowed === false);
        });
    });
});

//# sourceMappingURL=AccessControlService.test.js.map
