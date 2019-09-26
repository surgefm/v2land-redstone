/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */
module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Express middleware to use for every Sails request. To add custom          *
  * middleware to the mix, add a function to the middleware config object and *
  * add its key to the "order" array. The $custom key is reserved for         *
  * backwards-compatibility with Sails v0.9.x apps that use the               *
  * `customMiddleware` config option.                                         *
  *                                                                           *
  ****************************************************************************/

  middleware: {

  /***************************************************************************
  *                                                                          *
  * The order in which middleware should be run for HTTP request. (the Sails *
  * router is invoked by the "router" middleware below.)                     *
  *                                                                          *
  ***************************************************************************/

    order: [
      'cookieParser',
      'session',
      'bearerAuthentication',
      'bodyParser',
      'compress',
      'poweredBy',
      '$custom',
      'noCache',
      'router',
      'www',
      'favicon',
    ],

    noCache: function (req, res, next) {
      res.header("Cache-Control", "no-cache, no-store");
      return next();
    },

    bodyParser: require('skipper')({ limit: '4mb' }),

    bearerAuthentication: function (req, res, next) {
      if ((req.session && req.session.clientId) || !req.get('Authorization')) {
        return next();
      }

      const authorization = req.get('Authorization');
      if (authorization.slice(0, 7) != 'Bearer ') {
        return next();
      }

      const accessTokenStr = authorization.slice(7);
      const AuthorizationAccessToken = require('../seqModels/AuthorizationAccessToken');
      AuthorizationAccessToken.findOne({ where: { token: accessTokenStr } }).then(accessToken => {
        if (accessToken == null) {
          return res.status(400).json({
            message: '未找到该 AccessToken。',
          });
        } else if (accessToken.status == 'revoked') {
          return res.status(400).json({
            message: '你的 AccessToken 已失效。',
          });
        }

        req.session = req.session || {};
        req.session.clientId = accessToken.owner;
        next();
      });
    },

  }

  /***************************************************************************
  *                                                                          *
  * The number of seconds to cache flat files on disk being served by        *
  * Express static middleware (by default, these files are in `.tmp/public`) *
  *                                                                          *
  * The HTTP static cache is only active in a 'production' environment,      *
  * since that's the only time Express will cache flat-files.                *
  *                                                                          *
  ***************************************************************************/

  // cache: 31557600000
}
