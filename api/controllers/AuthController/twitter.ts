import { Auth } from '@Models';
import { oauth } from '@Configs';
import { RedstoneRequest, RedstoneResponse } from '@Types';

async function twitter(req: RedstoneRequest, res: RedstoneResponse) {
  const oa = oauth.twitter;

  if (!oa) {
    return res.status(503).json({
      message: '暂不支持 Twitter 绑定',
    });
  }

  const getToken = (): Promise<{ token: string; tokenSecret: string }> => {
    return new Promise((resolve, reject) => {
      oa.getOAuthRequestToken((err: any, token: string, tokenSecret: string) => {
        if (err) return reject(err);
        resolve({ token, tokenSecret });
      });
    });
  };

  try {
    const { token, tokenSecret } = await getToken();
    await Auth.create({
      site: 'twitter',
      token,
      tokenSecret,
      owner: req.session.clientId,
      redirect: req.query ? req.query.redirect : '',
    });

    let redirect = 'https://twitter.com/oauth/authenticate?oauth_token=';
    redirect += token;
    res.redirect(307, redirect);
  } catch (e) {
    console.error(e);
    return res.status(503).json({
      message: 'Twitter 绑定错误，请与开发者联系',
    });
  }
}

export default twitter;
