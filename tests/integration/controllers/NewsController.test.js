const request = require('supertest');
const urlencode = require('urlencode');
const assert = require('assert');
let agent;
let newsId;

const testEmail = process.env.TEST_EMAIL?
  process.env.TEST_EMAIL : 'vincent@langchao.co';
const testUsername = '陈博士的AI';

describe('NewsController', function() {
  before(async function() {
    agent = request.agent(sails.hooks.http.app);

    await News.destroy();
    await Event.destroy();

    await Event.create({
      name: '浪潮今天上线',
      description: '浪潮今天上线',
    });

    await Client.destroy();

    await agent
      .post('/client/register')
      .send({
        username: testUsername,
        password: 'testPassword',
        email: testEmail,
      });

    await Client.update(
      { username: testUsername },
      { role: 'manager' }
    );

    await agent
      .post('/client/login')
      .send({
        username: testUsername,
        password: 'testPassword',
      });
  });

  it('should return 404', async function() {
    await agent
      .post(`/event/${urlencode('浪潮今天不上线')}/news`)
      .send({
        url: 'https://langchao.co',
        source: 'source',
        title: '浪潮今天不上线',
        abstract: '浪潮今天不上线',
        time: new Date(),
      })
      .expect(404);
  });

  it('should create news', async function() {
    await agent
      .post(`/event/${urlencode('浪潮今天上线')}/news`)
      .send({
        url: 'https://langchao.co',
        source: 'source',
        title: '浪潮今天不上线',
        abstract: '浪潮今天不上线',
        time: new Date(),
      })
      .expect(201);
  });

  it('should create news', async function() {
    const res = await agent
      .post(`/event/${urlencode('浪潮今天上线')}/news`)
      .send({
        url: 'https://langchao.co/',
        source: 'source',
        title: '浪潮今天不上线啦',
        abstract: '浪潮今天不上线啦',
        time: new Date(),
      })
      .expect(201);
    newsId = res.body.news.id;
  });

  it('should return all pending news', async function() {
    const res = await agent
      .get('/news/pending')
      .expect(200);
    assert.equal(res.body.newsCollection.length, 0);
  });

  it('should return success', async function() {
    const res = await agent
      .put(`/news/${newsId}`)
      .send({
        title: '浪潮今天上线啦',
      })
      .expect(201);
    assert.equal('浪潮今天上线啦', res.body.news.title);
  });

  it('should change to pending success', async function() {
    await agent
      .put(`/news/${newsId}`)
      .send({
        status: 'pending',
      })
      .expect(201);
  });

  it('should change to rejected success', async function() {
    await agent
      .put(`/news/${newsId}`)
      .send({
        status: 'rejected',
      })
      .expect(201);
  });

  it('should change to admitted success', async function() {
    await agent
      .put(`/news/${newsId}`)
      .send({
        status: 'admitted',
      })
      .expect(201);
  });
});
