import { Auth } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';

async function twitterCallback(req: RedstoneRequest, res: RedstoneResponse) {
  if (!(req.query && req.query.oauth_token && req.query.oauth_verifier)) {
    return res.status(400).json({
      message: '请求缺少 token 或 verifier',
    });
  }

  const token = req.query.oauth_token;
  const verifier = req.query.oauth_verifier;

  const auth = await Auth.findOne({ where: { token } });
  if (!auth) {
    return res.status(404).json({
      message: '未找到该绑定信息',
    });
  }

  res.status(200).send(
    `<!DOCTYPE html>` +
    `<body>
    <script>window.location="${auth.redirect || '/auth/twitter/redirect?'}` +
    `&token=${token}` +
    `&verifier=${verifier}` +
    `&site=twitter"</script>
    </body>`
  );
}

export default twitterCallback;
