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

  describe('#login/logout()', function() {
    before(function(done) {
      agent
        .post('/client/register')
        .send({ username: 'testAccountLogin', password: 'testPassword' })
        .expect(201, {
          message: '注册成功',
        }, done);
    });

    after(async function() {
      await Client.destroy({
        username: 'testAccountLogin',
      });
    });

    it('should return success', function(done) {
      agent
        .post('/client/login')
        .send({
          username: 'testAccountLogin',
          password: 'testPassword',
        })
        .expect(200, done);
    });

    it('should return client\'s information', function(done) {
      agent
        .get('/client/me')
        .expect(200, done);
    });

    it('should log out successfully', function(done) {
      agent
        .get('/client/logout')
        .expect(200, {
          message: '成功退出登录',
        }, () => {
          agent
            .get('/client/me')
            .expect(401, {
              message: '请在登录后进行该操作',
            }, done);
        });
    });
  });

  describe('#logoutAfterGettingUnexistingClient', function() {
    it('should logout after the client ID stored in session does not exist', function(done) {
      agent
        .get('/client/me')
        .expect(401, {
          message: '请在登录后进行该操作',
        }, done);
    });
  });
});
