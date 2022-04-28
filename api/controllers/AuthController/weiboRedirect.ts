/* eslint-disable @typescript-eslint/camelcase */
import { Auth, Client, sequelize } from '@Models';
import { oauth, globals } from '@Configs';
import { RecordService, AuthService, ClientService } from '@Services';
import { hasS3, uploadFromUrl } from '@Services/UploadService';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import axios from 'axios';

async function weiboRedirect(req: RedstoneRequest, res: RedstoneResponse) {
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

  if (!account.owner && req.session.clientId) {
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
  } else if (account.owner) {
    await account.update({ profile: { ...data } });
    req.session.clientId = account.owner;
    res.status(200).json(AuthService.sanitize(account));
  } else {
    const profile = { ...data };

    let avatar: string;
    if (hasS3 && profile.avatar_hd) {
      avatar = await uploadFromUrl(profile.avatar_hd, '.jpg');
    }

    const newClient = await ClientService.createClient({
      username: await ClientService.randomlyGenerateUsername(profile.domain),
      nickname: profile.screen_name,
      description: profile.description,
      avatar,
      inviteCode: auth.inviteCode,
    });
    await account.update({
      profile,
      owner: newClient.id,
    });
    account = AuthService.sanitize(account);
    req.session.clientId = newClient.id;

    return res.status(201).json({
      message: '注册成功',
      auth: account,
      client: newClient,
    });
  }
}

export default weiboRedirect;
