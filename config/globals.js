/**
 * THIS FILE WAS ADDED AUTOMATICALLY by the Sails 1.0 app migration tool.
 * The original file was backed up as `config/globals-old.js.txt`
 */

const Sequelize = require('sequelize');
const { datastores } = require('./datastores');

const {
  host,
  user,
  password,
  database,
} = datastores.postgresql;

const sequelize = new Sequelize(database, user, password, {
  host,
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false,
  logging: process.env.NODE_ENV !== 'production' && process.env.SEQUELIZE_LOGGING !== 'false',
});

global.sequelize = sequelize;

module.exports.globals = {

  _: require('lodash'),

  async: require('async'),

  models: true,

  sails: true,

  site: process.env.SITE || 'https://langchao.org',
  api: process.env.API || 'https://api.langchao.org',

  notification: process.env.ENABLE_NOTIFICATION,
  officialAccount: {
    twitter: process.env.OFFICIAL_TWITTER || '768458621613072384',
    weibo: process.env.OFFICIAL_WEIBO || '6264484740',
  },

  telegramReviewChatId: process.env.TELEGRAM_REVIEW_ACCOUNT || '@langchao_review',
  telegramTestChatId: process.env.TELEGRAM_TEST_ACCOUNT || '@langchao_notification_test',

  inviteCode: process.env.INVITE_CODE || '渴望重回土地',

};
