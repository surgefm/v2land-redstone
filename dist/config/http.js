"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _Models_1 = require("@Models");
exports.default = {
    /** **************************************************************************
    *                                                                           *
    * Express middleware to use for every Sails request. To add custom          *
    * middleware to the mix, add a function to the middleware config object and *
    * add its key to the "order" array. The $custom key is reserved for         *
    * backwards-compatibility with Sails v0.9.x apps that use the               *
    * `customMiddleware` config option.                                         *
    *                                                                           *
    ****************************************************************************/
    middleware: {
        /** *************************************************************************
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
            res.header('Cache-Control', 'no-cache, no-store');
            return next();
        },
        bearerAuthentication: function (req, res, next) {
            if ((req.session && req.session.clientId) || !req.get('Authorization')) {
                return next();
            }
            const authorization = req.get('Authorization');
            if (authorization.slice(0, 7) != 'Bearer ') {
                return next();
            }
            const accessTokenStr = authorization.slice(7);
            _Models_1.AuthorizationAccessToken.findOne({ where: { token: accessTokenStr } }).then((accessToken) => {
                if (accessToken == null) {
                    return res.status(401).json({
                        message: '未找到该 AccessToken。',
                    });
                }
                else if (accessToken.status == 'revoked') {
                    return res.status(401).json({
                        message: '你的 AccessToken 已失效。',
                    });
                }
                else if (new Date(accessToken.expire) < new Date()) {
                    return res.status(401).json({
                        message: '你的 AccessToken 已过期。',
                    });
                }
                req.session.clientId = accessToken.owner;
                next();
            });
        },
    },
    /** *************************************************************************
    *                                                                          *
    * The number of seconds to cache flat files on disk being served by        *
    * Express static middleware (by default, these files are in `.tmp/public`) *
    *                                                                          *
    * The HTTP static cache is only active in a 'production' environment,      *
    * since that's the only time Express will cache flat-files.                *
    *                                                                          *
    ***************************************************************************/
    // cache: 31557600000
};

//# sourceMappingURL=http.js.map
