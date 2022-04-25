/* eslint-disable @typescript-eslint/camelcase */
import { Auth } from '@Models';
import { oauth, globals } from '@Configs';
import { RedstoneRequest, RedstoneResponse } from '@Types';

const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

async function google(req: RedstoneRequest, res: RedstoneResponse) {
  const oa = oauth.google;

  if (!oa) {
    return res.status(503).json({
      message: '暂不支持 Google 绑定',
    });
  }

  const auth = await Auth.create({
    site: 'google',
    owner: req.session.clientId,
    redirect: req.query ? req.query.redirect : '',
  });

  const callback = globals.api + '/auth/google/callback';

  res.redirect(307, oa.generateAuthUrl({
    access_type: 'offline',
    redirect_uri: callback,
    state: auth.id,
    include_granted_scopes: true,
    scope: scopes,
  }));
}

export default google;
