import { Auth, sequelize } from '@Models';
import { oauth } from '@Configs';
import { AuthService, ClientService, RecordService } from '@Services';
import { hasS3, uploadFromUrl } from '@Services/UploadService';
import { RedstoneRequest, RedstoneResponse } from '@Types';

async function twitterRedirect(req: RedstoneRequest, res: RedstoneResponse) {
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

  const getAccessToken = (): Promise<{ accessToken: string; accessTokenSecret: string }> => {
    return new Promise((resolve) => {
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
    return new Promise((resolve) => {
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

  if (!account.owner && req.session.clientId) {
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

    let avatar: string;
    if (hasS3 && profile.avatar_hd) {
      avatar = await uploadFromUrl(profile.profile_image_url, '.jpg');
    }

    const newClient = await ClientService.createClient({
      username: await ClientService.randomlyGenerateUsername(profile.screen_name),
      nickname: profile.name,
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

export default twitterRedirect;
