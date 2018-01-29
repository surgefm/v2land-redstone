const request = require('supertest');
let agent;

describe('EventController', function() {
  describe("createNews", function () {
    after(function (done) {
      Event.destroy({
        name: '浪潮今天发布啦',
      });
    });

    it('should return success', function (done) {
      agent = request.agent(sails.hooks.http.app);

      agent
        .post('/event')
        .send({

        })

    });
  })

  describe('should return success', function (done) {

  })
});
