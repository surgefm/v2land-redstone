/* eslint-disable no-invalid-this */
import request from 'supertest';
import urlencode from 'urlencode';
import assert from 'assert';
import { Client, Event, Stack, News, EventStackNews, HeaderImage, sequelize } from '@Models';
import { AccessControlService, CommitService } from '@Services';
import app from '~/app';

let agent: request.SuperTest<request.Test>;
let clientId = 0;
const testEmail = process.env.TEST_EMAIL ? process.env.TEST_EMAIL : 'vincent@langchao.org';
const testUsername = 'VincentAI';

describe('EventController', function() {
  let event: Event;
  this.timeout(10000);
  describe('createEvent', function() {
    before(async function() {
      agent = request.agent(app);
      await sequelize.query(`DELETE FROM commit`);
      await sequelize.query(`DELETE FROM event`);
      await sequelize.query(`DELETE FROM client`);

      const client = await Client.create({
        username: testUsername,
        nickname: testUsername,
        password: '$2b$10$8njIkPFgDouZsKXYrkYF4.xqShsOPMK9WHEU7aou4FAeuvzb4WRmi',
        email: testEmail,
      });

      await AccessControlService.addUserRoles(client.id, AccessControlService.roles.admins);
      clientId = client.id;
      await agent
        .post('/client/login')
        .send({
          username: testUsername,
          password: '666',
        });
    });

    it('should return success after creating event', function(done) {
      agent
        .post('/event')
        .send({
          name: '浪潮今天发布啦',
          description: '浪潮今天发布啦',
        })
        .expect(201, undefined, (err, res) => {
          event = res.body.event;
          done();
        });
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

    it('should update event rejected', function(done) {
      agent
        .put(`/event/${event.id}`)
        .send({
          status: 'rejected',
        })
        .expect(201)
        .end(done);
    });

    it('should update event admitted success', function(done) {
      agent
        .put(`/event/${event.id}`)
        .send({
          status: 'admitted',
        })
        .expect(201)
        .end(done);
    });

    it('should make event commit success', function(done) {
      agent
        .post(`/event/${event.id}/commit`)
        .send({
          summary: 'yoyo',
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
        .get(`/event/@${testUsername}/${urlencode('浪潮今天发布啦')}`)
        .expect(200)
        .end(done);
    });

    it('should return 404 when there is no such event', function(done) {
      agent
        .get(`/event/@${testUsername}/${urlencode('浪潮今天没有发布')}`)
        .expect(404)
        .end(done);
    });
  });

  describe('Event\'s header image', function() {
    before(async function() {
      await Event.destroy({
        where: {
          name: '浪潮今天发布了吗？',
        },
      });

      await HeaderImage.destroy({
        where: {
          sourceUrl: 'https://langchao.org/',
        },
      });

      event = await Event.create({
        name: '浪潮今天发布了吗？',
        description: '浪潮今天发布了吗？',
      });
      await AccessControlService.setClientEventOwner(clientId, event.id);
    });

    after(async function() {
      await Event.destroy({
        where: {
          name: '浪潮今天发布了吗？',
        },
      });

      await HeaderImage.destroy({
        where: {
          sourceUrl: 'https://langchao.org/',
        },
      });
    });

    it('should return success after creating header image', function(done) {
      agent
        .post(`/event/${event.id}/header_image`)
        .send({
          imageUrl: 'https://assets.v2land.net/750x200/default.jpg',
          source: '浪潮',
          sourceUrl: 'https://langchao.co/',
        })
        .expect(201, done);
    });

    it('should return success after updating header image', function(done) {
      agent
        .put(`/event/${event.id}/header_image`)
        .send({
          imageUrl: 'https://assets.v2land.net/750x300/default.jpg',
          source: '浪潮',
          sourceUrl: 'https://langchao.co/',
        })
        .expect(201, done);
    });

    it('should not return success when updating header image with wrong format', function(done) {
      agent
        .put(`/event/${event.id}/header_image`)
        .send({
          imageUrl: 'hfdshjk.jpg',
          source: '浪潮',
          sourceUrl: '<script></script>',
        })
        .expect(400, done);
    });
  });

  describe('Event List', function() {
    before(async function() {
      await sequelize.query(`DELETE FROM commit`);
      await sequelize.query(`DELETE FROM event`);
      for (let i = 0; i < 3; i++) {
        event = await Event.create({
          name: '浪潮测试' + (i + 1),
          status: 'admitted',
          description: '浪潮测试1',
        });
        const stack = await Stack.create({
          eventId: event.id,
          title: 'yoyo',
          status: 'admitted',
          order: 1,
          time: new Date(),
        });
        const news = await News.create({
          title: 'abc',
          source: 'Surge',
          abstract: 'S U R G E',
          time: new Date(),
          url: 'https://langchao.org/' + event.id,
          status: 'admitted',
        });
        await EventStackNews.create({
          eventId: event.id,
          stackId: stack.id,
          newsId: news.id,
        });
        await CommitService.makeCommit(event.id, clientId, 'hey');
      }
    });

    it('should have list', async function() {
      const res = await agent
        .get(`/event?page=1&status=admitted`)
        .expect(200);
      const eventList: ({ name: string })[] = res.body.eventList;
      assert.equal(eventList.length, 3);
      eventList.forEach((value, index) => {
        assert.equal(value.name, '浪潮测试' + (3 - index));
      });
    });
  });
});
