const SeqModels = require('../../../seqModels');

async function twitterRedirect (req, res) {
  if (!(req.query && req.query.token && req.query.verifier)) {
    return res.status(400).json({
      message: '请求缺少 token 或 verifier',
    });
  }

  const oa = sails.config.oauth.twitter;
  const { token, verifier } = req.query;

  const auth = await SeqModels.Auth.findOne({ token });
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
  const sameAuth = await SeqModels.Auth.findOne({
    where: {
      site: 'twitter',
      profileId: response.id_str,
    },
  });

  let account = sameAuth || auth;
  account.accessToken = accessToken;
  account.accessTokenSecret = accessTokenSecret;

  if (account.createdAt.toString() == account.updatedAt.toString()
    && req.session.clientId) {
    try {
      await sequelize.transaction(async transaction => {
        await account.update({
          owner: req.session.clientId,
          profile: { ...response },
        }, { transaction });
        await RecordService.create({
          model: 'auth',
          action: 'authorizeThirdPartyAccount',
          owner: req.session.clientId,
          target: account.id,
        }, { transaction });
      });
      res.status(201).json(AuthService.sanitize(account));
    } catch (err) {
      return res.serverError(err);
    }
  } else if (account.owner && (!req.session.clientId ||
    (req.session.clientId === account.owner))) {
    await account.update({
      profile: { ...resposne },
    });
    req.session.clientId = account.owner;
    res.status(200).json(AuthService.sanitize(account));
  } else {
    const profile = { ...response };
    profile.expireTime = Date.now() + 1000 * 60 * 60 * 12; // expires in 12 hours.
    profile.owner = req.sessionID;
    await account.update({ profile });

    if (!account.owner && !req.session.clientId) {
      account = AuthService.sanitize(account);

      res.status(202).json({
        name: 'authentication required',
        message: '请在登录后绑定第三方账号',
        auth: account,
      });
    } else {
      const conflict = await SeqModels.Client.findById(account.owner);
      if (!conflict) {
        await account.save({
          owner: req.session.clientId,
          profile: { ...response },
        });
        return res.status(201).json(AuthService.sanitize(account));
      }
      account = AuthService.sanitize(account);
      res.status(202).json({
        name: 'already connected',
        message: `该 Twitter 账号已被用户 ${conflict.username} 绑定，请选择是否解绑`,
        conflict: conflict.username,
        auth: account,
      });
    }
  }
}

module.exports = twitterRedirect;
