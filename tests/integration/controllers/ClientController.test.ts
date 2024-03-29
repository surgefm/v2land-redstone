import request from 'supertest';
import { sequelize } from '@Models';
import app from '~/app';

let agent: request.SuperTest<request.Test>;

const testEmail = process.env.TEST_EMAIL || 'test@langchao.org';

describe('ClientController', function() {
  describe('#register()', function() {
    before(async function() {
      await sequelize.query(`DELETE FROM commit`);
      await sequelize.query(`DELETE FROM client`);
    });

    it('should return success', function(done) {
      // Use agent to store session.
      agent = request.agent(app);

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

    it('should return an error message when the username is unavailable', async function() {
      await agent
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

  describe('#changePassword()', function() {
    const password = 'changedPassword1';

    before(async function() {
      await sequelize.query(`DELETE FROM client`);
    });

    it('should successfully change password', async function() {
      const res = await agent
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

      await agent
        .post('/client/login')
        .send({
          username: 'testChangePwd',
          password: 'testChangePassword1',
        })
        .expect(200);

      await agent
        .put('/client/password')
        .send({
          id: clientId,
          password,
        })
        .expect(201, {
          message: '更新密码成功',
        });
    });

    it('should login success', async function() {
      await agent
        .get('/client/logout')
        .expect(200, {
          message: '成功退出登录',
        });

      await agent
        .post('/client/login')
        .send({
          username: 'testChangePwd',
          password,
        })
        .expect(200);
    });
  });

  describe('#login/logout()', function() {
    before(async function() {
      await sequelize.query(`DELETE FROM client`);

      await agent
        .post('/client/register')
        .send({
          username: 'testAccountLogin',
          nickname: 'testAccountLogin',
          password: 'testPassword1',
          email: testEmail,
        })
        .expect(201);
    });

    it('should return success', async function() {
      await agent
        .post('/client/login')
        .send({
          username: 'testAccountLogin',
          password: 'testPassword1',
        })
        .expect(200);
    });

    it('should return client\'s information', async function() {
      await agent
        .get('/client/me')
        .expect(200);
    });

    it('should log out successfully', async function() {
      await agent
        .get('/client/logout')
        .expect(200, {
          message: '成功退出登录',
        });

      await agent
        .get('/client/me')
        .expect(401, {
          message: '请在登录后进行该操作',
        });
    });

    it('should logout after the client ID stored in session does not exist', async function() {
      await agent
        .get('/client/me')
        .expect(401, {
          message: '请在登录后进行该操作',
        });
    });
  });
});
