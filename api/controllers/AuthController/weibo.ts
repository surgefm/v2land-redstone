import { Auth } from '@Models';
import { oauth, globals } from '@Configs';
import { RedstoneRequest, RedstoneResponse } from '@Types';

async function weibo (req: RedstoneRequest, res: RedstoneResponse) {
  const oa = oauth.weibo;

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

  const callback = globals.api + '/auth/weibo/callback';

  res.redirect(307, oa.getAuthorizeUrl({
    redirect_uri: callback,
    state: auth.id,
  }));
}

export default weibo;
