const request = require('supertest');
const urlencode = require('urlencode');
const assert = require('assert');
let agent;

describe('EventController', function() {
  describe('createEvent', function() {
    before(async function() {
      await Event.destroy({
        name: '浪潮今天发布啦',
      });
    });

    after(async function() {
      await Event.destroy({
        name: '浪潮今天发布啦',
      });
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

  describe('Event\'s header image', function() {
    before(async function() {
      try {
        await Event.destroy({
          name: '浪潮今天发布了吗？',
        });

        await HeaderImage.destroy({
          sourceUrl: 'https://langchao.co/',
        });

        await Event.create({
          name: '浪潮今天发布了吗？',
          description: '浪潮今天发布了吗？',
        });
      } catch (err) {
        throw err;
      }
    });

    after(async function() {
      await Event.destroy({
        name: '浪潮今天发布了吗？',
      });

      await HeaderImage.destroy({
        sourceUrl: 'https://langchao.co/',
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
        .expect(201, done);
    });

    it('should return success', function(done) {
      agent = request.agent(sails.hooks.http.app);

      agent
        .put(`/event/${urlencode('浪潮今天发布了吗？')}/header_image`)
        .send({
          imageUrl: 'https://assets.v2land.net/750x300/default.jpg',
          source: '浪潮',
          sourceUrl: 'https://langchao.co/',
        })
        .expect(201, {
          message: '修改成功',
        }, done);
    });

    it('should not return success', function(done) {
      agent = request.agent(sails.hooks.http.app);

      agent
        .put(`/event/${urlencode('浪潮今天发布了吗？')}/header_image`)
        .send({
          imageUrl: '<script></script>',
          source: '浪潮',
          sourceUrl: 'https://langchao.co/',
        })
        .expect(400, done);
    });
  });

  describe('Event List', function() {
    before(async function() {
      await Event.destroy({
        name: '浪潮测试1',
      });
      await Event.destroy({
        name: '浪潮测试2',
      });
      await Event.destroy({
        name: '浪潮测试3',
      });
      await Event.create({
        name: '浪潮测试1',
        status: 'admitted',
        description: '浪潮测试1',
      });
      await Event.create({
        name: '浪潮测试2',
        status: 'admitted',
        description: '浪潮测试2',
      });
      await Event.create({
        name: '浪潮测试3',
        status: 'admitted',
        description: '浪潮测试3',
      });
    });
    after(async function() {
      await Event.destroy({
        name: '浪潮测试1',
      });
      await Event.destroy({
        name: '浪潮测试2',
      });
      await Event.destroy({
        name: '浪潮测试3',
      });
    });
    it('should have list', async function() {
      agent = request.agent(sails.hooks.http.app);

      agent
        .get(`/event`)
        .send()
        .expect(200, (err, res) => {
          if (err) {
            done(err, res);
          }
          const eventList = res.body.eventList;
          assert.equal(eventList.length, 3);
          eventList.forEach((value, index) => {
            assert.equal(value.name, '浪潮测试' + (3 - index));
          });
        });
    });
  });
});
