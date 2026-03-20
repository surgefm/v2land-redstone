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
const supertest_1 = __importDefault(require("supertest"));
const assert_1 = __importDefault(require("assert"));
const _Models_1 = require("@Models");
const app_1 = __importDefault(require("~/app"));
const _Services_1 = require("@Services");
let agent;
const testEmail = process.env.TEST_EMAIL ? process.env.TEST_EMAIL : 'vincent@langchao.org';
const testUsername = 'CCAVAI';
describe('StackController', function () {
    const stacks = [];
    let event;
    describe('createEvent', function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                agent = supertest_1.default.agent(app_1.default);
                yield _Models_1.sequelize.query(`DELETE FROM commit`);
                yield _Models_1.sequelize.query(`DELETE FROM stack`);
                yield _Models_1.sequelize.query(`DELETE FROM event`);
                yield _Models_1.sequelize.query(`DELETE FROM client`);
                const client = yield _Models_1.Client.create({
                    username: testUsername,
                    nickname: testUsername,
                    password: '$2b$10$8njIkPFgDouZsKXYrkYF4.xqShsOPMK9WHEU7aou4FAeuvzb4WRmi',
                    email: testEmail,
                });
                yield _Services_1.AccessControlService.addUserRoles(client.id, 'editors');
                yield agent
                    .post('/client/login')
                    .send({
                    username: testUsername,
                    password: '666',
                });
                event = yield _Models_1.Event.create({
                    name: '小熊维尼',
                    description: '吃蜂蜜',
                    status: 'admitted',
                });
                yield _Services_1.AccessControlService.setClientEventOwner(client.id, event.id);
            });
        });
        it('should create stack successfully', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const resp1 = yield agent
                    .post(`/event/${event.id}/stack`)
                    .send({
                    title: '111',
                    description: '111',
                    order: -1,
                    tiem: new Date(),
                })
                    .expect(201);
                stacks.push(resp1.body.stack);
                const resp2 = yield agent
                    .post(`/event/${event.id}/stack`)
                    .send({
                    title: '222',
                    description: '222',
                    order: -1,
                    tiem: new Date(),
                })
                    .expect(201);
                stacks.push(resp2.body.stack);
            });
        });
        it('should update stack successfully', function () {
            return __awaiter(this, void 0, void 0, function* () {
                for (const stack of stacks) {
                    const res = yield agent
                        .post(`/event/${event.id}/news`)
                        .send({
                        url: `https://langchao.org/${Date.now()}`,
                        source: 'source',
                        title: '浪潮今天不上线',
                        abstract: '浪潮今天不上线',
                        time: new Date(),
                        stackId: stack.id,
                    });
                    yield agent
                        .put(`/news/${res.body.news.id}`)
                        .send({
                        status: 'admitted',
                    });
                    yield agent
                        .put(`/stack/${stack.id}`)
                        .send({
                        status: 'admitted',
                        order: 1,
                    })
                        .expect(201);
                }
            });
        });
        it('should get stacks successfully', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const { body } = yield agent
                    .get(`/event/${event.id}`)
                    .expect(200);
                const { stacks } = body;
                assert_1.default.equal(stacks.length, 2);
            });
        });
    });
});

//# sourceMappingURL=StackController.test.js.map
