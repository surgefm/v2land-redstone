let request = require('supertest');
let agent;

describe('ClientController', function() {
  describe('#register()', function() {
    after(function(done) {
      Client.destroy({
        username: 'testAccountRegister',
      }).exec(done);
    });

    it('should return success', function(done) {
      // Use agent to store session.
      agent = request.agent(sails.hooks.http.app);

      agent
        .post('/client/register')
        .send({ username: 'testAccountRegister', password: 'testPassword' })
        .expect(201, {
          message: '注册成功',
        }, done);
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

    after(function(done) {
      Client.destroy({
        username: 'testAccountLogin',
      }).exec(done);
    });

    it('should return success', function(done) {
      agent
        .post('/client/login')
        .send({
          username: 'testAccountLogin',
          password: 'testPassword',
        })
        .expect(200, {
          message: '登录成功',
        }, done);
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
<<<<<<< HEAD
              message: '你还未登录',
=======
              message: '请在登录后进行该操作',
>>>>>>> 608583a97030113e28831d627c8756863bc2e2da
            }, done);
        });
    });
  });

  describe('#logoutAfterGettingUnexistingClient', function() {
    it('should logout after the client ID stored in session does not exist', function(done) {
      agent
        .get('/client/me')
        .expect(401, {
<<<<<<< HEAD
          message: '你还未登录',
=======
          message: '请在登录后进行该操作',
>>>>>>> 608583a97030113e28831d627c8756863bc2e2da
        }, done);
    });
  });
});
