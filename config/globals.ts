/**
 * THIS FILE WAS ADDED AUTOMATICALLY by the Sails 1.0 app migration tool.
 * The original file was backed up as `config/globals-old.js.txt`
 */

import { Sequelize } from 'sequelize-typescript';
import { postgresql } from './datastores';

const {
  host,
  user,
  password,
  database,
} = postgresql;

const sequelize = new Sequelize(database, user, password, {
  host,
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  logging: process.env.NODE_ENV !== 'production' && process.env.SEQUELIZE_LOGGING !== 'false',
});

global.sequelize = sequelize;

export default {

  site: process.env.SITE || 'https://langchao.org',
  api: process.env.API || 'https://api.langchao.org',

  notification: process.env.ENABLE_NOTIFICATION,
  officialAccount: {
    twitter: process.env.OFFICIAL_TWITTER || '768458621613072384' as (string | [string]),
    weibo: process.env.OFFICIAL_WEIBO || '6264484740' as (string | [string]),
  },

  telegramReviewChatId: process.env.TELEGRAM_REVIEW_ACCOUNT || '@langchao_review',
  telegramTestChatId: process.env.TELEGRAM_TEST_ACCOUNT || '@langchao_notification_test',

  inviteCode: process.env.INVITE_CODE || '渴望重回土地',

  environment: process.env.NODE_ENV || 'development',

};
