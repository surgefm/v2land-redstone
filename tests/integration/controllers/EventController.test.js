const request = require('supertest');
const urlencode = require('urlencode');
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

    it('should update success', function(done) {
      agent = request.agent(sails.hooks.http.app);

      agent
        .put(`/event/${urlencode('浪潮今天发布啦')}`)
        .send({
          description: '浪潮今天发布啦啦啦啦啦啦',
        })
        .expect(201)
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

    it('should return success', function(done) {
      agent = request.agent(sails.hooks.http.app);

      agent
        .get(`/event/${urlencode('浪潮今天发布啦')}`)
        .send()
        .expect(200)
        .end(done);
    });

    it('should return 404', function(done) {
      agent = request.agent(sails.hooks.http.app);

      agent
        .get(`/event/${urlencode('浪潮今天没有发布')}`)
        .send({
        })
        .expect(404)
        .end(done);
    });
  });
});
