import { Auth, Client, sequelize } from '@Models';
import { oauth } from '@Configs';
import { AuthService, RecordService } from '@Services';
import { RedstoneRequest, RedstoneResponse } from '@Types';

async function twitterRedirect (req: RedstoneRequest, res: RedstoneResponse) {
  if (!(req.query && req.query.token && req.query.verifier)) {
    return res.status(400).json({
      message: '请求缺少 token 或 verifier',
    });
  }

  const oa = oauth.twitter;
  const { token, verifier } = req.query;

  const auth = await Auth.findOne({ where: { token } });
  if (!auth) {
    return res.status(404).json({
      message: '未找到该绑定信息',
    });
  }

  const getAccessToken = (): Promise<{ accessToken: string, accessTokenSecret: string }> => {
    return new Promise((resolve, reject) => {
      oa.getOAuthAccessToken(
        token,
        auth.tokenSecret,
        verifier,
        (err, accessToken, accessTokenSecret) => {
          if (err) {
            req.log.error(err);
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

  const getResponse = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      oa.get(
        'https://api.twitter.com/1.1/account/verify_credentials.json',
        accessToken,
        accessTokenSecret,
        (err, response) => {
          if (err) {
            req.log.error(err);
            return res.status(400).json({
              message: '在验证绑定状况时发生了错误',
            });
          }
          resolve(response as string);
        }
      );
    });
  };

  const responseStr = await getResponse();
  if (!responseStr) return;
  const response = JSON.parse(responseStr);
  auth.profileId = response.id_str;
  const sameAuth = await Auth.findOne({
    where: {
      site: 'twitter',
      profileId: response.id_str,
    },
  });

  let account = sameAuth || auth;
  account.accessToken = accessToken;
  account.accessTokenSecret = accessTokenSecret;
  await account.save();

  if (account.createdAt.toString() == account.updatedAt.toString()
    && req.session.clientId) {
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
  } else if (account.owner && (!req.session.clientId ||
    (req.session.clientId === account.owner))) {
    await account.update({
      profile: { ...response },
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
      const conflict = await Client.findByPk(account.owner);
      if (!conflict) {
        account.owner = req.session.clientId;
        account.profile = { ...response };
        await account.save();
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

export default twitterRedirect;
