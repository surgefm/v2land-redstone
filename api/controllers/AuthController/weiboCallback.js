const SeqModels = require('../../../seqModels');

async function weiboCallback (req, res) {
  if (!(req.query && req.query.code && req.query.state)) {
    return res.status(400).json({
      message: '请求缺少 code 或 state 参数',
    });
  }

  const { code, state } = req.query;
  const auth = await SeqModels.Auth.findByPk(state);

  if (!auth) {
    return res.status(404).json({
      message: '未找到该绑定信息',
    });
  }

  if (auth.redirect) {
    res.status(200).send(
      `<!DOCTYPE html>` +
      `<body>
      <script>window.location="${auth.redirect}` +
      `&code=${code}` +
      `&authId=${state}` +
      `&site=weibo` +
      `"</script>
      </body>`
    );
  } else {
    res.status(200).send(
      `<!DOCTYPE html>` +
      `<body>
      <script>window.location="${sails.config.globals.api}/auth/weibo/redirect` +
      `?code=${code}` +
      `&authId=${state}` +
      `&site=weibo` +
      `"</script>
      </body>`
    );
  }
}

module.exports = weiboCallback;
