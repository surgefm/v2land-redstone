const request = require('supertest');
let agent;

const testEmail = process.env.TEST_EMAIL || 'vincent@langchao.org';

describe('ClientController', function() {
  describe('#register()', function() {
    before(function(done) {
      Client.destroy({}, done);
    });

    after(async function() {
      await Client.destroy({
        username: 'testRegister',
      });
    });

    it('should return success', function(done) {
      // Use agent to store session.
      agent = request.agent(sails.hooks.http.app);

      agent
        .post('/client/register')
        .send({
          username: 'testRegister',
          password: 'testPassword',
          email: testEmail,
        })
        .expect(201, done);
    });
  });

  describe('#changePassword()', function() {
    const password = 'changedPassword';

    before(async function() {
      await Client.destroy({
        username: 'testChangePwd',
      });
    });

    it('should successfully change password', async function() {
      const res = await agent
        .post('/client/register')
        .send({
          username: 'testChangePwd',
          password: 'testChangePassword',
          email: testEmail,
        })
        .expect(201);

      const { client } = JSON.parse(res.text);
      clientId = client.id;

      await agent
        .post('/client/login')
        .send({
          username: 'testChangePwd',
          password: 'testChangePassword',
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
      // await Client.destroy({
      //   username: 'testAccountLogin',
      // });
      await Client.destroy();

      await agent
        .post('/client/register')
        .send({
          username: 'testAccountLogin',
          password: 'testPassword',
          email: testEmail,
        })
        .expect(201);
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

    it('should logout after the client ID stored in session does not exist', async function() {
      await agent
        .get('/client/me')
        .expect(401, {
          message: '请在登录后进行该操作',
        });
    });
  });

  // describe('#logoutAfterGettingUnexistingClient', function() {
  //   it('should logout after the client ID stored in session does not exist', async function() {
  //     await agent
  //       .get('/client/me')
  //       .expect(401, {
  //         message: '请在登录后进行该操作',
  //       });
  //   });
  // });
});
