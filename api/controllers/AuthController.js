/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  options: require('./AuthController/options'),

  authorize: require('./AuthController/authorize'),

  unauthorize: require('./AuthController/unauthorize'),

  twitter: require('./AuthController/twitter'),

  twitterCallback: require('./AuthController/twitterCallback'),

  twitterRedirect: require('./AuthController/twitterRedirect'),

  weibo: require('./AuthController/weibo'),

  weiboCallback: require('./AuthController/weiboCallback'),

  weiboRedirect: require('./AuthController/weiboRedirect'),

};
