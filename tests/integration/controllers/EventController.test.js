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

  describe('header image', function() {
    before(function(done) {
      Event.destroy({
        name: '浪潮今天发布了吗？',
      }).exec((err) => {
        HeaderImage.destroy({
          imageUrl: 'https://assets.v2land.net/750x200/default.jpg',
        }).exec(() => {
          Event.create({
            name: '浪潮今天发布了吗？',
            description: '浪潮今天发布了吗？',
          }).exec(done);
        });
      });
    });

    after(function(done) {
      Event.destroy({
        name: '浪潮今天发布了吗？',
      }).exec(() => {
        HeaderImage.destroy({
          imageUrl: 'https://assets.v2land.net/750x200/default.jpg',
        }).exec(done);
      });
    });

    it('should return success', function(done) {
      agent = request.agent(sails.hooks.http.app);

      agent
        .post(`/event/${urlencode('浪潮今天发布了吗？')}/header_image`)
        .send({
          imageUrl: 'https://assets.v2land.net/750x200/default.jpg',
          source: '浪潮',
          sourceUrl: 'https://langchao.co/',
        })
        .expect(201, (err, res) => {
          if (err) {
            console.log(res.body);
          }
          done(err, res);
        });
        // .end(done);
    });

    // it('should not return success', function(done) {
    //   agent = request.agent(sails.hooks.http.app);

    //   agent
    //     .post(`/event/${urlencode('浪潮今天发布了吗？')}/header_image`)
    //     .send({
    //       imageUrl: '<script></script>',
    //       source: '浪潮',
    //       sourceUrl: 'https://langchao.co/',
    //     })
    //     .expect(201)
    //     .end(done);
    // });
  });
});
