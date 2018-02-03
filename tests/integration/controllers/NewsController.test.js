const request = require('supertest');
let agent;

describe('NewsController', function() {
  before(async function() {
    //
  });

  after(async function() {
    //
  });

  it('should return all pending news', function(done) {
    agent = request.agent(sails.hooks.http.app);

    agent
      .get('/news/pending')
      .send()
      .expect(200)
      .end(done);
  });
});
