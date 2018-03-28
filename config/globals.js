/**
 * Global Variable Configuration
 * (sails.config.globals)
 *
 * Configure which global variables which will be exposed
 * automatically by Sails.
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.globals.html
 */
module.exports.globals = {

  site: process.env.SITE || 'https://langchao.org',
  api: process.env.API || 'https://api.langchao.org',
  notification: process.env.ENABLE_NOTIFICATION,
  officialAccount: {
    twitter: process.env.OFFICIAL_TWITTER || '768458621613072384',
    weibo: process.env.OFFICIAL_WEIBO || '6264484740',
  },
  inviteCode: process.env.INVITE_CODE || '渴望重回土地',

}
