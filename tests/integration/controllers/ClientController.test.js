let request = require('supertest');

describe('ClientController', function() {
  describe('#register()', function() {
    it('should return success', function(done) {
      request(sails.hooks.http.app)
        .post('/register')
        .send({ username: 'test_controller', password: 'test_controller' })
        .expect(200, {
          message: 'success',
        }, done);
    });
  });
  describe('#login()', function() {
    it('should return success', function(done) {
      request(sails.hooks.http.app)
        .post('/login')
        .send({ username: 'test_controller', password: 'test_controller' })
        .expect(200, {
          message: 'success',
        }, () => {
          // clean work
          Client.destroy({
            username: 'test_controller',
          }).exec((err) => {
            if (err) {
              done(err);
            }

            done();
          });
        });
    });
  });
});
