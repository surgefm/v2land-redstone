const request = require('supertest');
let agent;

describe('ClientController', function() {
  describe('#register()', function() {
    before(function(done) {
      Client.destroy({}, done);
    });

    after(async function() {
      await Client.destroy({
        username: 'testAccountRegister',
      });
    });

    it('should return success', function(done) {
      // Use agent to store session.
      agent = request.agent(sails.hooks.http.app);

      agent
        .post('/client/register')
        .send({ username: 'testAccountRegister', password: 'testPassword' })
        .expect(201, done);
    });
  });

  describe('#changePassword()', function() {
    const password = 'changedPassword';

    before(async function() {
      await Client.destroy({
        username: 'testChangePassword',
      });
    });

    it('should successfully change password', async function() {
      await agent
        .post('/client/register')
        .send({ username: 'testChangePassword', password: 'testChangePassword' })
        .expect(201);

      await agent
        .post('/client/login')
        .send({
          username: 'testChangePassword',
          password: 'testChangePassword',
        })
        .expect(200);

      await agent
        .put('/client/password')
        .send({
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
          username: 'testChangePassword',
          password,
        })
        .expect(200);
    });
  });

  describe('#login/logout()', function() {
    before(async function() {
      await agent
        .post('/client/register')
        .send({
          username: 'testAccountLogin',
          password: 'testPassword',
        })
        .expect(201);
    });

    after(async function() {
      await Client.destroy({
        username: 'testAccountLogin',
      });
    });

    it('should return success', async function() {
      await agent
        .post('/client/login')
        .send({
          username: 'testAccountLogin',
          password: 'testPassword',
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
  });

  describe('#logoutAfterGettingUnexistingClient', function() {
    it('should logout after the client ID stored in session does not exist', async function() {
      await agent
        .get('/client/me')
        .expect(401, {
          message: '请在登录后进行该操作',
        });
    });
  });
});
