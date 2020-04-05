/* eslint-disable @typescript-eslint/camelcase */
import { Auth, Client, sequelize } from '@Models';
import { oauth, globals } from '@Configs';
import { RecordService, AuthService } from '@Services';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import axios from 'axios';

async function weiboRedirect (req: RedstoneRequest, res: RedstoneResponse) {
  if (!(req.query && req.query.code && req.query.authId)) {
    return res.status(400).json({
      message: '请求缺少 code 或 authId',
    });
  }

  const oa = oauth.weibo;
  const { code, authId } = req.query;

  const getAccessToken = (): Promise<{ accessToken: string; refreshToken?: string}> => {
    return new Promise((resolve) => {
      oa.getOAuthAccessToken(
        code,
        {
          'redirect_uri': globals.api + '/auth/weibo/callback',
          'grant_type': 'authorization_code',
        },
        (err, accessToken, refreshToken) => {
          if (err) {
            req.log.error(err);
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
  const auth = await Auth.findByPk(authId);
  if (!auth) {
    return res.status(404).json({
      message: '未找到该绑定信息',
    });
  }

  const response = await axios.post(
    'https://api.weibo.com/oauth2/get_token_info?access_token=' + accessToken,
    { access_token: accessToken }
  );
  auth.profileId = response.data.uid + '';

  const data = (await axios.get(
    'https://api.weibo.com/2/users/show.json?' +
      `uid=${response.data.uid}&access_token=${accessToken}`
  )).data;

  const sameAuth = await Auth.findOne({
    where: {
      site: 'weibo',
      profileId: response.data.uid + '',
    },
  });

  let account = sameAuth || auth;
  account.accessToken = accessToken;
  account.refreshToken = refreshToken;
  await account.save();

  if (account.createdAt.toString() == account.updatedAt.toString() &&
    req.session.clientId) {
    await sequelize.transaction(async transaction => {
      await account.update({
        owner: req.session.clientId,
        profile: { ...data },
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
    await account.update({ profile: { ...data } });
    req.session.clientId = account.owner;
    res.status(200).json(AuthService.sanitize(account));
  } else {
    const profile = { ...data };
    profile.expireTime = Date.now() + 1000 * 60 * 60 * 12; // expires in 12 hours.
    profile.owner = req.sessionID;
    await account.update({ profile });

    if (!account.owner && !req.session.clientId) {
      account = AuthService.sanitize(account);

      return res.status(202).json({
        name: 'authentication required',
        message: '请在登录后绑定第三方账号',
        auth: account,
      });
    } else {
      const conflict = await Client.findByPk(account.owner);
      if (!conflict) {
        await account.update({
          owner: req.session.clientId,
          profile: { ...data },
        });
        return res.status(201).json(AuthService.sanitize(account));
      }
      account = AuthService.sanitize(account);
      res.status(202).json({
        name: 'already connected',
        message: `该微博账号已被用户 ${conflict.username} 绑定，请选择是否解绑`,
        conflict: conflict.username,
        auth: account,
      });
    }
  }
}

export default weiboRedirect;
