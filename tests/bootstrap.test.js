let sails = require('sails');

before(function(done) {
  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(2000);

  sails.lift({
    // configuration for testing purposes
  }, function(err) {
    if (err) return done(err);
    // here you can load fixtures, etc.
    done(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});
