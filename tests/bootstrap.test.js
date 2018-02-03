let sails = require('sails');

before(function(done) {
  // Increase the Mocha timeout so that Sails has enough time to lift.
<<<<<<< HEAD
  this.timeout(2000);
=======
  this.timeout(20000);
>>>>>>> 608583a97030113e28831d627c8756863bc2e2da

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
