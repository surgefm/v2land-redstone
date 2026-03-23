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
const urlencode_1 = __importDefault(require("urlencode"));
const assert_1 = __importDefault(require("assert"));
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
const app_1 = __importDefault(require("~/app"));
let agent;
let clientId = 0;
const testEmail = process.env.TEST_EMAIL ? process.env.TEST_EMAIL : 'vincent@langchao.org';
const testUsername = 'VincentAI';
describe('EventController', function () {
    let event;
    this.timeout(10000);
    describe('createEvent', function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                agent = supertest_1.default.agent(app_1.default);
                yield _Models_1.sequelize.query(`DELETE FROM commit`);
                yield _Models_1.sequelize.query(`DELETE FROM event`);
                yield _Models_1.sequelize.query(`DELETE FROM client`);
                const client = yield _Models_1.Client.create({
                    username: testUsername,
                    nickname: testUsername,
                    password: '$2b$10$8njIkPFgDouZsKXYrkYF4.xqShsOPMK9WHEU7aou4FAeuvzb4WRmi',
                    email: testEmail,
                });
                yield _Services_1.AccessControlService.addUserRoles(client.id, _Services_1.AccessControlService.roles.admins);
                clientId = client.id;
                yield agent
                    .post('/client/login')
                    .send({
                    username: testUsername,
                    password: '666',
                });
            });
        });
        it('should return success after creating event', function (done) {
            agent
                .post('/event')
                .send({
                name: '浪潮今天发布啦',
                description: '浪潮今天发布啦',
            })
                .expect(201, undefined, (err, res) => {
                event = res.body.event;
                done();
            });
        });
        it('event name cannot be duplicate', function (done) {
            agent
                .post('/event')
                .send({
                name: '浪潮今天发布啦',
                description: '浪潮今天发布啦',
            })
                .expect(409, {
                message: '已有同名事件或事件正在审核中',
            })
                .end(done);
        });
        it('should update event rejected', function (done) {
            agent
                .put(`/event/${event.id}`)
                .send({
                status: 'rejected',
            })
                .expect(201)
                .end(done);
        });
        it('should update event admitted success', function (done) {
            agent
                .put(`/event/${event.id}`)
                .send({
                status: 'admitted',
            })
                .expect(201)
                .end(done);
        });
        it('should make event commit success', function (done) {
            agent
                .post(`/event/${event.id}/commit`)
                .send({
                summary: 'yoyo',
            })
                .expect(201)
                .end(done);
        });
        it('should get event', function (done) {
            agent
                .get('/event')
                .send({
                eventName: '浪潮今天发布啦',
            })
                .expect(200)
                .end(done);
        });
        it('should return success after getting the event', function (done) {
            agent
                .get(`/event/@${testUsername}/${(0, urlencode_1.default)('浪潮今天发布啦')}`)
                .expect(200)
                .end(done);
        });
        it('should return 404 when there is no such event', function (done) {
            agent
                .get(`/event/@${testUsername}/${(0, urlencode_1.default)('浪潮今天没有发布')}`)
                .expect(404)
                .end(done);
        });
    });
    describe('Event\'s header image', function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield _Models_1.Event.destroy({
                    where: {
                        name: '浪潮今天发布了吗？',
                    },
                });
                yield _Models_1.HeaderImage.destroy({
                    where: {
                        sourceUrl: 'https://langchao.org/',
                    },
                });
                event = yield _Models_1.Event.create({
                    name: '浪潮今天发布了吗？',
                    description: '浪潮今天发布了吗？',
                });
                yield _Services_1.AccessControlService.setClientEventOwner(clientId, event.id);
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield _Models_1.Event.destroy({
                    where: {
                        name: '浪潮今天发布了吗？',
                    },
                });
                yield _Models_1.HeaderImage.destroy({
                    where: {
                        sourceUrl: 'https://langchao.org/',
                    },
                });
            });
        });
        it('should return success after creating header image', function (done) {
            agent
                .post(`/event/${event.id}/header_image`)
                .send({
                imageUrl: 'https://assets.v2land.net/750x200/default.jpg',
                source: '浪潮',
                sourceUrl: 'https://langchao.co/',
            })
                .expect(201, done);
        });
        it('should return success after updating header image', function (done) {
            agent
                .put(`/event/${event.id}/header_image`)
                .send({
                imageUrl: 'https://assets.v2land.net/750x300/default.jpg',
                source: '浪潮',
                sourceUrl: 'https://langchao.co/',
            })
                .expect(201, done);
        });
        it('should not return success when updating header image with wrong format', function (done) {
            agent
                .put(`/event/${event.id}/header_image`)
                .send({
                imageUrl: 'hfdshjk.jpg',
                source: '浪潮',
                sourceUrl: '<script></script>',
            })
                .expect(400, done);
        });
    });
    describe('Event List', function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield _Models_1.sequelize.query(`DELETE FROM commit`);
                yield _Models_1.sequelize.query(`DELETE FROM event`);
                for (let i = 0; i < 3; i++) {
                    event = yield _Models_1.Event.create({
                        name: '浪潮测试' + (i + 1),
                        status: 'admitted',
                        description: '浪潮测试1',
                    });
                    const stack = yield _Models_1.Stack.create({
                        eventId: event.id,
                        title: 'yoyo',
                        status: 'admitted',
                        order: 1,
                        time: new Date(),
                    });
                    const news = yield _Models_1.News.create({
                        title: 'abc',
                        source: 'Surge',
                        abstract: 'S U R G E',
                        time: new Date(),
                        url: 'https://langchao.org/' + event.id,
                        status: 'admitted',
                    });
                    yield _Models_1.EventStackNews.create({
                        eventId: event.id,
                        stackId: stack.id,
                        newsId: news.id,
                    });
                    yield _Services_1.CommitService.makeCommit(event.id, clientId, 'hey');
                }
            });
        });
        it('should have list', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield agent
                    .get(`/event?page=1&status=admitted`)
                    .expect(200);
                const eventList = res.body.eventList;
                assert_1.default.equal(eventList.length, 3);
                eventList.forEach((value, index) => {
                    assert_1.default.equal(value.name, '浪潮测试' + (3 - index));
                });
            });
        });
    });
});

//# sourceMappingURL=EventController.test.js.map
