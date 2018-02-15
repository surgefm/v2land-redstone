/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const axios = require('axios');
const queryString = require('query-string');

module.exports = {

  options: (req, res) => {
    res.status(200).json({
      twitter: sails.config.oauth.twitter ? true : false,
      weibo: sails.config.oauth.weibo ? true : false,
    });
  },

  authorize: async (req, res) => {
    if (!(req.body && req.body.authId)) {
      return res.status(400).json({
        message: '缺少参数：authId',
      });
    }

    const auth = await Auth.findOne({ id: req.body.authId });
    if (!auth || !auth.profile) {
      return res.status(404).json({
        message: '未找到该绑定信息',
      });
    }

    const { expireTime, owner } = auth.profile;

    if (!owner || owner !== req.sessionID) {
      return res.status(403).json({
        message: '你无权进行该绑定',
      });
    } else if (!expireTime || Date.now() > expireTime) {
      return res.status(403).json({
        message: '已过绑定时效，请重新发起绑定',
      });
    }

    auth.owner = req.body.clientId || req.session.clientId;
    await auth.save();

    res.status(201).json({
      message: '绑定成功',
    });

    const data = {
      id: auth.id,
      site: auth.site,
      profileId: auth.profileId,
      owner: auth.owner,
    };

    await Record.create({
      model: 'Auth',
      target: data.id,
      data,
      client: req.session.clientId,
      operation: 'update',
      action: 'authorizeThirdPartyAccount',
    });
  },

  unauthorize: async (req, res) => {
    if (!req.param('authId')) {
      return res.status(400).json({
        message: '缺少参数：authId',
      });
    }

    const auth = await Auth.findOne({ id: req.param('authId') });
    if (!auth) {
      return res.status(404).json({
        message: '未找到该绑定信息',
      });
    }

    if (auth.owner !== req.session.clientId) {
      return res.status(403).json({
        message: '你无权进行该解绑',
      });
    }

    await SQLService.destroy({
      model: 'auth',
      action: 'unauthorizeThirdPartyAccount',
      client: req.session.clientId,
      where: { id: auth.id },
    });

    res.status(201).json({
      message: '成功解除绑定',
    });
  },

  twitter: async (req, res) => {
    const oa = sails.config.oauth.twitter;

    if (!oa) {
      return res.status(503).json({
        message: '暂不支持 Twitter 绑定',
      });
    }

    const getToken = () => {
      return new Promise((resolve, reject) => {
        oa.getOAuthRequestToken((err, token, tokenSecret, result) => {
          if (err) return reject(err);
          resolve({ token, tokenSecret });
        });
      });
    };

    const { token, tokenSecret } = await getToken();

    await Auth.create({
      site: 'twitter',
      token,
      tokenSecret,
      owner: req.session.clientId,
      redirect: req.query ? req.query.redirect : '',
    });

    let redirect = 'https://twitter.com/oauth/authenticate?oauth_token=';
    redirect += token;
    res.redirect(307, redirect);
  },

  twitterCallback: async (req, res) => {
    if (!(req.query && req.query.oauth_token && req.query.oauth_verifier)) {
      return res.status(400).json({
        message: '请求缺少 token 或 verifier',
      });
    }

    const token = req.query.oauth_token;
    const verifier = req.query.oauth_verifier;

    const auth = await Auth.findOne({ token });
    if (!auth) {
      return res.status(404).json({
        message: '未找到该绑定信息',
      });
    }

    res.status(200).send(
      `<!DOCTYPE html>` +
      `<body>
      <script>window.location="${auth.redirect}` +
      `&token=${token}` +
      `&verifier=${verifier}` +
      `&site=twitter"</script>
      </body>`
    );
  },

  twitterRedirect: async (req, res) => {
    if (!(req.query && req.query.token && req.query.verifier)) {
      return res.status(400).json({
        message: '请求缺少 token 或 verifier',
      });
    }

    const oa = sails.config.oauth.twitter;
    const { token, verifier } = req.query;

    const auth = await Auth.findOne({ token });
    if (!auth) {
      return res.status(404).json({
        message: '未找到该绑定信息',
      });
    }

    const getAccessToken = () => {
      return new Promise((resolve, reject) => {
        oa.getOAuthAccessToken(
          token,
          auth.tokenSecret,
          verifier,
          (err, accessToken, accessTokenSecret) => {
            if (err) {
              sails.log.error(err);
              return res.status(400).json({
                message: '在验证绑定状况时发生了错误',
              });
            }
            resolve({ accessToken, accessTokenSecret });
          }
        );
      });
    };

    const { accessToken, accessTokenSecret } = await getAccessToken();
    if (!accessToken || !accessTokenSecret) return;

    const getResponse = () => {
      return new Promise((resolve, reject) => {
        oa.get(
          'https://api.twitter.com/1.1/account/verify_credentials.json',
          accessToken,
          accessTokenSecret,
          (err, response) => {
            if (err) {
              sails.log.error(err);
              return res.status(400).json({
                message: '在验证绑定状况时发生了错误',
              });
            }
            resolve(response);
          }
        );
      });
    };

    let response = await getResponse();
    if (!response) return;
    response = JSON.parse(response);
    auth.profileId = response.id_str;
    const sameAuth = await Auth.findOne({
      site: 'twitter',
      profileId: response.id_str,
    });

    let account = sameAuth || auth;
    account.accessToken = accessToken;
    account.accessTokenSecret = accessTokenSecret;

    if (account.createdAt.toString() == account.updatedAt.toString()
      && req.session.clientId) {
      account.owner = req.session.clientId;
      account.profile = { ...response };
      await account.save();
      res.status(201).json(AuthService.sanitize(account));
    } else if (account.owner && (!req.session.clientId ||
      (req.session.clientId === account.owner))) {
      account.profile = { ...response };
      await account.save();
      req.session.clientId = account.owner;
      res.status(200).json(AuthService.sanitize(account));
    } else {
      const profile = { ...response };
      profile.expireTime = Date.now() + 1000 * 60 * 60 * 12; // expires in 12 hours.
      profile.owner = req.sessionID;
      account.profile = profile;
      await account.save();

      if (!account.owner && !req.session.clientId) {
        account = AuthService.sanitize(account);

        res.status(202).json({
          name: 'authentication required',
          message: '请在登录后绑定第三方账号',
          auth: account,
        });
      } else {
        const conflict = await Client.findOne({ id: account.owner });
        account = AuthService.sanitize(account);
        res.status(202).json({
          name: 'already connected',
          message: `该 Twitter 账号已被用户 ${conflict.username} 绑定，请选择是否解绑`,
          conflict: conflict.username,
          auth: account,
        });
      }
    }
  },

  weibo: async (req, res) => {
    const oa = sails.config.oauth.weibo;

    if (!oa) {
      return res.status(503).json({
        message: '暂不支持微博绑定',
      });
    }

    const auth = await Auth.create({
      site: 'weibo',
      owner: req.session.clientId,
      redirect: req.query ? req.query.redirect : '',
    });

    const callback = sails.config.globals.api + '/auth/weibo/callback';

    res.redirect(307, oa.getAuthorizeUrl({
      redirect_uri: callback,
      state: auth.id,
    }));
  },

  weiboCallback: async (req, res) => {
    if (!(req.query && req.query.code && req.query.state)) {
      return res.status(400).json({
        message: '请求缺少 code 或 state 参数',
      });
    }

    const { code, state } = req.query;
    const auth = await Auth.findOne({ id: state });

    if (!auth) {
      return res.status(404).json({
        message: '未找到该绑定信息',
      });
    }

    res.status(200).send(
      `<!DOCTYPE html>` +
      `<body>
      <script>window.location="${auth.redirect}` +
      `&code=${code}` +
      `&authId=${state}` +
      `&site=weibo` +
      `"</script>
      </body>`
    );
  },

  weiboRedirect: async (req, res) => {
    if (!(req.query && req.query.code && req.query.authId)) {
      return res.status(400).json({
        message: '请求缺少 code 或 authId',
      });
    }

    const oa = sails.config.oauth.weibo;
    const { code, authId } = req.query;

    const getAccessToken = () => {
      return new Promise((resolve, reject) => {
        oa.getOAuthAccessToken(
          code,
          {
            'redirect_uri': sails.config.globals.api + '/auth/weibo/callback',
            'grant_type': 'authorization_code',
          },
          (err, accessToken, refreshToken) => {
            if (err) {
              sails.log.error(err);
              return res.status(400).json({
                message: '在验证绑定状况时发生了错误',
              });
            }
            resolve({ accessToken, refreshToken });
          }
        );
      });
    };

    const { accessToken, refreshToken } = await getAccessToken();
    if (!accessToken) return;

    const auth = await Auth.findOne({ id: authId });
    if (!auth) {
      return res.status(404).json({
        message: '未找到该绑定信息',
      });
    }

    const response = await axios.post(
      'https://api.weibo.com/oauth2/get_token_info?access_token=' + accessToken,
      { access_token: accessToken }
    );
    auth.profileId = response.data.uid;

    const query = queryString.stringify({
      access_token: accessToken,
      uid: response.data.uid,
    });

    const { data } = await axios.get(
      'https://api.weibo.com/2/users/show.json?' + query
    );

    const sameAuth = await Auth.findOne({
      site: 'weibo',
      profileId: response.data.uid,
    });

    let account = sameAuth || auth;
    account.accessToken = accessToken;
    account.refreshToken = refreshToken;

    if (account.createdAt.toString() == account.updatedAt.toString() &&
      req.session.clientId) {
      account.profile = { ...data };
      account.owner = req.session.clientId;
      await account.save();
      res.status(201).json(AuthService.sanitize(account));
    } else if (account.owner && (!req.session.clientId ||
      (req.session.clientId === account.owner))) {
      account.profile = { ...data };
      await account.save();
      req.session.clientId = account.owner;
      res.status(200).json(AuthService.sanitize(account));
    } else {
      const profile = { ...data };
      profile.expireTime = Date.now() + 1000 * 60 * 60 * 12; // expires in 12 hours.
      profile.owner = req.sessionID;
      account.profile = profile;
      await account.save();

      if (!account.owner && !req.session.clientId) {
        account = AuthService.sanitize(account);

        res.status(202).json({
          name: 'authentication required',
          message: '请在登录后绑定第三方账号',
          auth: account,
        });
      } else {
        const conflict = await Client.findOne({ id: account.owner });
        account = AuthService.sanitize(account);
        res.status(202).json({
          name: 'already connected',
          message: `该微博账号已被用户 ${conflict.username} 绑定，请选择是否解绑`,
          conflict: conflict.username,
          auth: account,
        });
      }
    }
  },

};
