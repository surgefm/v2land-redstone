const SeqModels = require('../../../seqModels');

async function twitterCallback (req, res) {
  if (!(req.query && req.query.oauth_token && req.query.oauth_verifier)) {
    return res.status(400).json({
      message: '请求缺少 token 或 verifier',
    });
  }

  const token = req.query.oauth_token;
  const verifier = req.query.oauth_verifier;

  const auth = await SeqModels.Auth.findOne({ where: { token } });
  if (!auth) {
    return res.status(404).json({
      message: '未找到该绑定信息',
    });
  }

  res.status(200).send(
    `<!DOCTYPE html>` +
    `<body>
    <script>window.location="${auth.redirect}` +
    `&token=${token}` +
    `&verifier=${verifier}` +
    `&site=twitter"</script>
    </body>`
  );
}

module.exports = twitterCallback;
