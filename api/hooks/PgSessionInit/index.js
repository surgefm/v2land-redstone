const { Client } = require('pg');
const fs = require('fs');

module.exports = function PgSessionInit(sails) {
  return {

    initialize: function(cb) {
      if (!process.env.REDIS_HOST) {
        const postgresConfig = { ...sails.config.connections.postgresql }; // copy the config
        delete postgresConfig['adapter'];
        const content = fs.readFileSync('node_modules/v2land-sails-pg-session/sql/sails-pg-session-support.sql', 'utf8');

        const client = new Client(postgresConfig);
        client.connect();

        client.query(content, (err, res) => {
          if (!err) { // success
            console.log('PgSession init success');
            client.end();
          } else if (err.code !== '42P07') {
            client.end();
            throw err;
          }

          cb();
        });
      }

    },

  };
};
