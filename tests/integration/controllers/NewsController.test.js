const request = require('supertest');
const urlencode = require('urlencode');
const assert = require('assert');
const SeqModels = require('../../../seqModels');

let agent;
let newsId;

const testEmail = process.env.TEST_EMAIL?
  process.env.TEST_EMAIL : 'vincent@langchao.co';
const testUsername = '陈博士的AI';

const testEventName = '陈博女装';

describe.skip('NewsController', function() {
  before(async function() {
    agent = request.agent(sails.hooks.http.app);

    global.sequelize.query(`DELETE FROM news`);
    global.sequelize.query(`DELETE FROM event`);
    global.sequelize.query(`DELETE FROM client`);

    await SeqModels.Event.create({
      name: testEventName,
      description: '浪潮今天上线',
      status: 'admitted',
    });

    await agent
      .post('/client/register')
      .send({
        username: testUsername,
        password: 'testPassword',
        email: testEmail,
      });

    const client = await SeqModels.Client.findOne({
      where: {
        username: testUsername,
      },
    });

    client.role = 'manager';
    await client.save();

    await agent
      .post('/client/login')
      .send({
        username: testUsername,
        password: 'testPassword',
      });
  });

  it('should return 404', async function() {
    await agent
      .post(`/event/${urlencode(testEventName + '吗？')}/news`)
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
      .post(`/event/${urlencode(testEventName)}/news`)
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
      .post(`/event/${urlencode(testEventName)}/news`)
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
    assert.equal(res.body.newsCollection.length, 2);
  });

  it('should change title success', async function() {
    const res = await agent
      .put(`/news/${newsId}`)
      .send({
        title: '浪潮今天不上线啦啦啦',
      })
      .expect(201);
    assert.equal('浪潮今天不上线啦啦啦', res.body.news.title);
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
