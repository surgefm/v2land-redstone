let request = require('supertest');
let agent;

describe('ClientController', function() {
  describe('#register()', function() {
    it('should return success', function(done) {
      // Use agent to store session.
      agent = request.agent(sails.hooks.http.app);

      agent
        .post('/register')
        .send({ username: 'test_controller', password: 'test_controller' })
        .expect(201, {
          message: '注册成功',
        }, done);
    });
  });

  describe('#login()', function() {
    it('should return success', function(done) {
      agent
        .post('/login')
        .send({ username: 'test_controller', password: 'test_controller' })
        .expect(200, {
          message: '登录成功',
        }, done);
    });
  });

  describe('#role()', function() {
    it('shoule return role of a user', function(done) {
      agent
        .get('/role')
        .expect(200, {
          role: 'contributor',
        }, done);
    });
    it('should change role of a user', function(done) {
      agent
        .post('/role')
        .send({
          role: 'admin',
        })
        .expect(200, {
          message: '更新用户组成功',
        }, done);
    });
  });

  describe('#getClientDetail()', function() {
    it('should return client\'s information', function(done) {
      agent
        .get('/client/me')
        .expect(200, done);
    });
  });

  describe('#logout()', function() {
    it('should log out successfully', function(done) {
      agent
        .get('/logout')
        .expect(200, {
          message: '成功退出登录',
        }, () => {
          agent
            .get('/client/me')
            .expect(401, {
              message: '你还未登录',
            }, done);
        });
    });
  });

  describe('#deleteClient', function() {
    it('should delete client successfully', function(done) {
      // Save the session for future test first.
      agent
        .post('/login')
        .send({ username: 'test_controller', password: 'test_controller' })
        .expect(200, {
          message: '登录成功',
        }, () => {
          // Start deleting client.
          Client.destroy({
            username: 'test_controller',
          }).exec((err) => {
            done(err);
          });
        });
    });
  });

  describe('#getUnexistingClient', function() {
    it('should claim that client is not found', function(done) {
      agent
        .get('/client/me')
        .expect(404, {
          message: '未找到该用户',
        }, done);
    });
  });

  describe('#logoutAfterGettingUnexistingClient', function() {
    it('should logout after the client ID stored in session does not exist', function(done) {
      agent
        .get('/client/me')
        .expect(401, {
          message: '你还未登录',
        }, done);
    });
  });
});
