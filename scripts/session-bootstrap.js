const { Client } = require('pg');
const fs = require('fs');
const connectionsConfig = require('../config/connections');

const postgresConfig = connectionsConfig.connections.postgresql;

delete postgresConfig['adapter'];

const content = fs.readFileSync('node_modules/sails-pg-session/sql/sails-pg-session-support.sql', 'utf8');

const client = new Client(postgresConfig);
client.connect();

client.query(content, (err, res) => {
  if (err) {
    console.log(err.code === '42P07');
  }
  client.end();
});
