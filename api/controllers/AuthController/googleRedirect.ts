/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
import { google } from 'googleapis';
import { GaxiosResponse } from 'gaxios';
import { oauth2_v2 } from 'googleapis/build/src/apis/oauth2/v2';
import { Auth, Client, sequelize } from '@Models';
import { oauth } from '@Configs';
import { RecordService, AuthService, ClientService } from '@Services';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { hasS3, uploadFromUrl } from '@Services/UploadService';
import { charset } from '@Services/UtilService/generateRandomAlphabetString';

async function googleRedirect(req: RedstoneRequest, res: RedstoneResponse) {
  if (!(req.query && req.query.code && req.query.authId)) {
    return res.status(400).json({
      message: '请求缺少 code 或 authId',
    });
  }

  const oa = oauth.google;
  const { code, authId } = req.query;

  const { tokens } = await oa.getToken(code);
  const accessToken = tokens.access_token;
  const refreshToken = tokens.refresh_token;
  oa.setCredentials(tokens);

  const auth = await Auth.findByPk(authId);
  if (!auth) {
    return res.status(404).json({
      message: '未找到该绑定信息',
    });
  }

  const response: GaxiosResponse<oauth2_v2.Schema$Userinfo> = await new Promise((resolve, reject) => {
    google.oauth2('v2').userinfo.get({
      auth: oa,
    }, (err, data) => (err ? reject(err) : resolve(data)));
  });

  const profile = response.data;
  auth.profileId = profile.id + '';

  const sameAuth = await Auth.findOne({
    where: {
      site: 'google',
      profileId: profile.id + '',
    },
  });

  let account = sameAuth || auth;
  account.accessToken = accessToken;
  account.refreshToken = refreshToken;
  await account.save();

  const sameEmailClient = await Client.findOne({
    where: {
      email: profile.email,
    },
  });

  if (account.createdAt.toString() == account.updatedAt.toString() &&
    req.session.clientId) {
    await sequelize.transaction(async transaction => {
      await account.update({
        owner: req.session.clientId,
        profile,
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
    await account.update({ profile });
    req.session.clientId = account.owner;
    res.status(200).json(AuthService.sanitize(account));
  } else if (sameEmailClient) {
    sameEmailClient.emailVerified = true;
    if (!sameEmailClient.avatar && hasS3) {
      const avatarUrl = profile.picture.replace('=s96-c', '=s512-c');
      sameEmailClient.avatar = await uploadFromUrl(avatarUrl, 'jpg');
    }
    account.owner = sameEmailClient.id;
    account.profile = profile;
    await sameEmailClient.save();
    await account.save();
    req.session.clientId = sameEmailClient.id;
    res.status(201).json(AuthService.sanitize(account));
  } else {
    let username: string;
    let gmailUsername = profile.email
      .split('@')[0]
      .split('')
      .filter(c => charset.includes(c))
      .join('');

    let exists = await Client.findOne({ where: { username: gmailUsername } });
    if (!exists) username = gmailUsername;
    else {
      gmailUsername = profile.email.split('').filter(c => charset.includes(c)).join('');
      exists = await Client.findOne({ where: { username: gmailUsername } });
      if (!exists) {
        username = gmailUsername;
      } else {
        username = await ClientService.randomlyGenerateUsername();
      }
    }

    let nickname = profile.name
      .split('')
      .filter(c => c !== '@' && c !== '%')
      .slice(0, 16)
      .join('');
    let allDigit = true;
    for (const char of nickname) {
      if (!/\d/.test(char)) {
        allDigit = false;
        break;
      }
    }
    if (allDigit) nickname = 'Google_' + nickname;
    if (nickname.length < 2) nickname = 'Google user';
    nickname = nickname.slice(0, 16);

    let avatar: string;
    if (hasS3) {
      const avatarUrl = profile.picture.replace('=s96-c', '=s512-c');
      avatar = await uploadFromUrl(avatarUrl, 'jpg');
    }

    const newClient = await ClientService.createClient({
      username,
      nickname,
      hashedPassword: '',
      avatar,
      email: profile.email,
      emailVerified: true,
      inviteCode: auth.inviteCode,
    });

    await account.update({ profile, owner: newClient.id });
    account = AuthService.sanitize(account);
    req.session.clientId = newClient.id;

    return res.status(201).json({
      message: '注册成功',
      auth: account,
      client: newClient,
    });
  }
}

export default googleRedirect;
