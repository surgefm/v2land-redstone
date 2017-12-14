describe('ClientModel', function() {
  describe('#find()', function() {
    it('should check find function', function(done) {
      Client.find()
      .then(function(results) {
        // some tests
        done();
      })
      .catch(done);
    });
  });
  describe('#create()', function() {
    it('should create and destroy client', function(done) {
      Client.create({
        username: 'test',
        password: 'test6666666',
      }).exec((err, finn) => {
        if (err) {
          done(err);
        }

        Client.destroy({
          username: 'test',
          password: 'test6666666',
        }).exec((err) => {
          if (err) {
            done(err);
          }

          done();
        });
      });
    });
  });
});
