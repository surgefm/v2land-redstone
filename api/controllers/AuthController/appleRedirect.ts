/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable camelcase */
import { Auth } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { RecordService, AuthService, ClientService } from '@Services';
import appleSignin from 'apple-signin-auth';

async function appleRedirect(req: RedstoneRequest, res: RedstoneResponse) {
  const { APPLE_CLIENT_ID } = process.env;

  if (!APPLE_CLIENT_ID) {
    return res.status(503).json({
      message: '暂不支持 Apple 登录',
    });
  }

  if (!(req.query && req.query.res)) {
    return res.status(400).json({
      message: '请求缺少 res',
    });
  }

  const r = JSON.parse(decodeURIComponent(req.query.res));
  const { authorization, user } = r;
  const { id_token } = authorization;

  let id: string;
  let email: string;
  try {
    const { sub, email: e } = await appleSignin.verifyIdToken(id_token, {
      audience: APPLE_CLIENT_ID,
    });
    id = sub;
    email = e;
  } catch (err) {
    return res.status(403).json({
      message: '无法验证用户',
    });
  }

  const existingAuth = await Auth.findOne({
    where: {
      profileId: `${id}`,
      site: 'apple',
    },
  });

  if (existingAuth) {
    existingAuth.profile = r;
    if (existingAuth.owner) {
      await existingAuth.save();
      req.session.clientId = existingAuth.owner;
      return res.status(200).json(AuthService.sanitize(existingAuth));
    } else if (req.session.clientId) {
      existingAuth.owner = req.body.clientId;
      await existingAuth.save();
      await RecordService.create({
        model: 'auth',
        action: 'authorizeThirdPartyAccount',
        owner: req.session.clientId,
        target: existingAuth.id,
      });
      return res.status(201).json(AuthService.sanitize(existingAuth));
    }
  }

  const username = user ? user.first_name + user.last_name : id;
  const clientUsername = await ClientService.randomlyGenerateUsername(username);
  let nickname = (user ? `${user.first_name} ${user.last_name}` : id).slice(0, 16);
  if (nickname.length < 2) {
    nickname = id.slice(0, 16);
  }

  const newClient = await ClientService.createClient({
    username: clientUsername,
    nickname,
    inviteCode: req.query.inviteCode || '',
    email,
    emailVerified: true,
  });

  const auth = existingAuth || await Auth.create({
    site: 'apple',
    profileId: `${id}`,
    profile: r,
  });

  auth.owner = newClient.id;
  await auth.save();

  req.session.clientId = newClient.id;

  return res.status(201).json({
    message: '注册成功',
    auth: AuthService.sanitize(auth),
    client: newClient,
  });
}

export default appleRedirect;
