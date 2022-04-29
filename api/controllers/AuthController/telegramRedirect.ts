/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable camelcase */
import crypto from 'crypto';
import { Auth } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { RecordService, AuthService, UploadService, ClientService } from '@Services';
import { TELE_TOKEN } from '@Services/TelegramService';

async function twitter(req: RedstoneRequest, res: RedstoneResponse) {
  if (!TELE_TOKEN) {
    return res.status(503).json({
      message: '暂不支持 Telegram 绑定',
    });
  }

  if (!(req.query && req.query.res)) {
    return res.status(400).json({
      message: '请求缺少 res',
    });
  }

  const r = JSON.parse(decodeURIComponent(req.query.res));
  const { first_name, last_name, id, photo_url, username, hash } = r;
  const dataCheckString = Object.keys(r).filter(r => r !== 'hash').sort().map(k => `${k}=${r[k]}`).join('\n');
  const secretKey = crypto.createHash('sha256').update(TELE_TOKEN).digest();
  const hashed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  if (hashed !== hash) {
    return res.status(404).json({
      message: 'hash 错误',
    });
  }

  const existingAuth = await Auth.findOne({
    where: {
      profileId: `${id}`,
      site: 'telegram',
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

  let avatar: string;
  if (UploadService.hasS3) {
    avatar = await UploadService.uploadFromUrl(photo_url, '.jpg');
  }
  const clientUsername = await ClientService.randomlyGenerateUsername(username);

  const newClient = await ClientService.createClient({
    username: clientUsername,
    nickname: `${first_name} ${last_name}`,
    avatar,
    inviteCode: req.query.inviteCode || '',
  });

  const auth = existingAuth || await Auth.create({
    site: 'telegram',
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

export default twitter;
