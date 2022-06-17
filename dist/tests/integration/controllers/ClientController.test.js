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
const _Models_1 = require("@Models");
const app_1 = __importDefault(require("~/app"));
let agent;
const testEmail = process.env.TEST_EMAIL || 'test@langchao.org';
describe('ClientController', function () {
    describe('#register()', function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield _Models_1.sequelize.query(`DELETE FROM commit`);
                yield _Models_1.sequelize.query(`DELETE FROM client`);
            });
        });
        it('should return success', function (done) {
            // Use agent to store session.
            agent = supertest_1.default.agent(app_1.default);
            agent
                .post('/client/register')
                .send({
                username: 'testRegister',
                nickname: 'testRegister',
                password: 'testPassword1',
                email: testEmail,
            })
                .expect(201, done);
        });
        it('should return an error message when the username is unavailable', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield agent
                    .post('/client/register')
                    .send({
                    username: 'login',
                    nickname: 'testChangePwd',
                    password: 'testChangePassword1',
                    email: testEmail,
                })
                    .expect(400, {
                    message: '用户名不可用',
                });
            });
        });
    });
    describe('#changePassword()', function () {
        const password = 'changedPassword1';
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield _Models_1.sequelize.query(`DELETE FROM client`);
            });
        });
        it('should successfully change password', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield agent
                    .post('/client/register')
                    .send({
                    username: 'testChangePwd',
                    nickname: 'testChangePwd',
                    password: 'testChangePassword1',
                    email: testEmail,
                })
                    .expect(201);
                const { client } = JSON.parse(res.text);
                const clientId = client.id;
                yield agent
                    .post('/client/login')
                    .send({
                    username: 'testChangePwd',
                    password: 'testChangePassword1',
                })
                    .expect(200);
                yield agent
                    .put('/client/password')
                    .send({
                    id: clientId,
                    password,
                })
                    .expect(201, {
                    message: '更新密码成功',
                });
            });
        });
        it('should login success', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield agent
                    .get('/client/logout')
                    .expect(200, {
                    message: '成功退出登录',
                });
                yield agent
                    .post('/client/login')
                    .send({
                    username: 'testChangePwd',
                    password,
                })
                    .expect(200);
            });
        });
    });
    describe('#login/logout()', function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield _Models_1.sequelize.query(`DELETE FROM client`);
                yield agent
                    .post('/client/register')
                    .send({
                    username: 'testAccountLogin',
                    nickname: 'testAccountLogin',
                    password: 'testPassword1',
                    email: testEmail,
                })
                    .expect(201);
            });
        });
        it('should return success', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield agent
                    .post('/client/login')
                    .send({
                    username: 'testAccountLogin',
                    password: 'testPassword1',
                })
                    .expect(200);
            });
        });
        it('should return client\'s information', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield agent
                    .get('/client/me')
                    .expect(200);
            });
        });
        it('should log out successfully', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield agent
                    .get('/client/logout')
                    .expect(200, {
                    message: '成功退出登录',
                });
                yield agent
                    .get('/client/me')
                    .expect(401, {
                    message: '请在登录后进行该操作',
                });
            });
        });
        it('should logout after the client ID stored in session does not exist', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield agent
                    .get('/client/me')
                    .expect(401, {
                    message: '请在登录后进行该操作',
                });
            });
        });
    });
});

//# sourceMappingURL=ClientController.test.js.map
