const request = require('supertest');
const urlencode = require('urlencode');
const assert = require('assert');
let agent;

const testEmail = process.env.TEST_EMAIL?
  process.env.TEST_EMAIL : 'vincent@langchao.co';
const testUsername = '计量经济学家的AI';

describe('EventController', function() {
  this.timeout(10000);
  describe('createEvent', function() {
    before(async function() {
      agent = request.agent(sails.hooks.http.app);

      await Event.destroy();

      await Client.destroy();

      await agent
        .post('/client/register')
        .send({
          username: testUsername,
          password: 'testPassword',
          email: testEmail,
        });

      await agent
        .post('/client/login')
        .send({
          username: testUsername,
          password: 'testPassword',
        });

      await Client.update(
        { username: testUsername },
        { role: 'admin' }
      );
    });

    it('should return success after creating event', function(done) {
      agent
        .post('/event')
        .send({
          name: '浪潮今天发布啦',
          description: '浪潮今天发布啦',
        })
        .expect(201)
        .end(done);
    });

    it('event name cannot be duplicate', function(done) {
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

    it('should update event pending success', function(done) {
      agent
        .put(`/event/${urlencode('浪潮今天发布啦')}`)
        .send({
          status: 'pending',
        })
        .expect(201)
        .end(done);
    });

    it('should update event rejected', function(done) {
      agent
        .put(`/event/${urlencode('浪潮今天发布啦')}`)
        .send({
          status: 'rejected',
        })
        .expect(201)
        .end(done);
    });

    it('should update event admitted success', function(done) {
      agent
        .put(`/event/${urlencode('浪潮今天发布啦')}`)
        .send({
          status: 'admitted',
        })
        .expect(201)
        .end(done);
    });

    it('should get event', function(done) {
      agent
        .get('/event')
        .send({
          eventName: '浪潮今天发布啦',
        })
        .expect(200)
        .end(done);
    });

    it('should return success after getting the event', function(done) {
      agent
        .get(`/event/${urlencode('浪潮今天发布啦')}`)
        .expect(200)
        .end(done);
    });

    it('should return 404 when there is no such event', function(done) {
      agent
        .get(`/event/${urlencode('浪潮今天没有发布')}`)
        .expect(404)
        .end(done);
    });
  });

  describe('Event\'s header image', function() {
    before(async function() {
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
    });

    after(async function() {
      await Event.destroy({
        name: '浪潮今天发布了吗？',
      });

      await HeaderImage.destroy({
        sourceUrl: 'https://langchao.co/',
      });
    });

    it('should return success after creating header image', function(done) {
      agent
        .post(`/event/${urlencode('浪潮今天发布了吗？')}/header_image`)
        .send({
          imageUrl: 'https://assets.v2land.net/750x200/default.jpg',
          source: '浪潮',
          sourceUrl: 'https://langchao.co/',
        })
        .expect(201, done);
    });

    it('should return success after updating header image', function(done) {
      agent
        .put(`/event/${urlencode('浪潮今天发布了吗？')}/header_image`)
        .send({
          imageUrl: 'https://assets.v2land.net/750x300/default.jpg',
          source: '浪潮',
          sourceUrl: 'https://langchao.co/',
        })
        .expect(201, done);
    });

    it('should not return success when updating header image with wrong format', function(done) {
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
    const sleep = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    before(async function() {
      this.timeout(15000);

      await Event.destroy();
      await Event.create({
        name: '浪潮测试1',
        status: 'admitted',
        description: '浪潮测试1',
      });
      await sleep(1000);
      await Event.create({
        name: '浪潮测试2',
        status: 'admitted',
        description: '浪潮测试2',
      });
      await sleep(1000);
      await Event.create({
        name: '浪潮测试3',
        status: 'admitted',
        description: '浪潮测试3',
      });
    });
    after(async function() {
      await Client.destroy({
        username: '浪潮测试机器人',
      });
    });
    it('should have list', async function() {
      agent
        .get(`/event`)
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
