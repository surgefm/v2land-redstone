const request = require('supertest');
let agent;

describe('EventController', function() {
  describe('createEvent', function() {
    before(function(done) {
      Event.destroy({
        name: '浪潮今天发布啦',
      }).exec(done);
    });

    after(function(done) {
      Event.destroy({
        name: '浪潮今天发布啦',
      }).exec(done);
    });

    it('should return success', function(done) {
      agent = request.agent(sails.hooks.http.app);

      agent
        .post('/event')
        .send({
          name: '浪潮今天发布啦',
          description: '浪潮今天发布啦',
        })
        .expect(201)
        .end(done);
    });

    it('can not duplicate', function(done) {
      agent = request.agent(sails.hooks.http.app);

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

    it('should get event', function(done) {
      agent = request.agent(sails.hooks.http.app);

      agent
        .get('/event')
        .send({
          eventName: '浪潮今天发布啦',
        })
        .expect(200)
        .end(done);
    });
  });
});
