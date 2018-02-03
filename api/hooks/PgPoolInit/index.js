const { Pool } = require('pg');

module.exports = function PgPoolInit(sails) {
  return {

    initialize: function(cb) {
      const pool = new Pool(sails.config.connections.postgresql);
      sails.pgPool = pool;
      cb();
    },

  };
};
