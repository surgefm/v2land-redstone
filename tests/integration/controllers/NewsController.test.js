const request = require('supertest');
const urlencode = require('urlencode');
const assert = require('assert');
let agent;
let newsId;

describe('NewsController', function() {
  before(async function() {
    await News.destroy();
    await Event.destroy();

    await Event.create({
      name: '浪潮今天上线',
      description: '浪潮今天上线',
    });
  });

  it('should return 404', function(done) {
    agent = request.agent(sails.hooks.http.app);

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
      .expect(201)
      .end(done);
  });

  it('should return all pending news', function(done) {
    agent
      .get('/news/pending')
      .expect(200, (err, res) => {
        if (err) {
          done(err);
          return;
        }
        assert.equal(res.body.newsCollection.length, 2);
        newsId = res.body.newsCollection[0].id;
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
