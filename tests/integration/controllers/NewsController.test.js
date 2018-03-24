const request = require('supertest');
const urlencode = require('urlencode');
const assert = require('assert');
let agent;
let newsId;

const testEmail = process.env.TEST_EMAIL?
  process.env.TEST_EMAIL : 'vincent@langchao.co';

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
        username: 'testRegister',
        password: 'testPassword',
        email: testEmail,
      });

    await Client.update(
      { username: 'testRegister' },
      { role: 'admin' }
    );

    await agent
      .post('/client/login')
      .send({
        username: 'testRegister',
        password: 'testPassword',
      });
  });

  it('should return 404', function(done) {
    agent
      .post(`/event/${urlencode('浪潮今天不上线')}/news`)
      .send({
        url: 'https://langchao.co',
        source: 'source',
        title: '浪潮今天不上线',
        abstract: '浪潮今天不上线',
        time: new Date(),
      })
      .expect(404)
      .end(done);
  });

  it('should create news', function(done) {
    agent
      .post(`/event/${urlencode('浪潮今天上线')}/news`)
      .send({
        url: 'https://langchao.co',
        source: 'source',
        title: '浪潮今天不上线',
        abstract: '浪潮今天不上线',
        time: new Date(),
      })
      .expect(201)
      .end(done);
  });

  it('should create news', function(done) {
    agent
      .post(`/event/${urlencode('浪潮今天上线')}/news`)
      .send({
        url: 'https://langchao.co/',
        source: 'source',
        title: '浪潮今天不上线啦',
        abstract: '浪潮今天不上线啦',
        time: new Date(),
      })
      .expect(201, (err, res) => {
        newsId = res.body.news.id;
        done();
      });
  });

  it('should return all pending news', function(done) {
    agent
      .get('/news/pending')
      .expect(200, (err, res) => {
        if (err) {
          done(err);
          return;
        }
        assert.equal(res.body.newsCollection.length, 0);
        done();
      });
  });

  it('should return success', function(done) {
    agent
      .put(`/news/${newsId}`)
      .send({
        title: '浪潮今天上线啦',
      })
      .expect(201, (err, res) => {
        if (err) {
          return done(err);
        }
        assert.equal('浪潮今天上线啦', res.body.news.title);
        done();
      });
  });
});
