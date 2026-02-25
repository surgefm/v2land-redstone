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
const supertest_1 = __importDefault(require("supertest"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
const app_1 = __importDefault(require("~/app"));
let agent;
const testEmail = process.env.TEST_EMAIL ? process.env.TEST_EMAIL : 'vincent@langchao.org';
const testUsername = 'AlanAI';
const testEventName = '陈博女装';
describe('NewsController', function () {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            agent = supertest_1.default.agent(app_1.default);
            yield _Models_1.sequelize.query(`DELETE FROM commit`);
            yield _Models_1.sequelize.query(`DELETE FROM news`);
            yield _Models_1.sequelize.query(`DELETE FROM event`);
            yield _Models_1.sequelize.query(`DELETE FROM client`);
            yield _Models_1.Event.create({
                name: testEventName,
                description: '浪潮今天上线',
                status: 'admitted',
            });
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hash = yield bcryptjs_1.default.hash('testPassword', salt);
            const client = yield _Models_1.Client.create({
                username: testUsername,
                nickname: testUsername,
                password: hash,
                email: testEmail,
                role: 'manager',
            }, {
                raw: true,
            });
            yield _Services_1.AccessControlService.addUserRoles(client.id, 'admins');
            yield agent
                .post('/client/login')
                .send({
                username: testUsername,
                password: 'testPassword',
            });
        });
    });
    it('should return 404', function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.timeout(50000);
            yield agent
                .post(`/event/${-1}/news`)
                .send({
                url: 'https://langchao.org',
                source: 'source',
                title: '浪潮今天不上线',
                abstract: '浪潮今天不上线',
                time: new Date(),
            })
                .expect(404);
        });
    });
});

//# sourceMappingURL=NewsController.test.js.map
