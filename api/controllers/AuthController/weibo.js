const SeqModels = require('../../../seqModels');

async function weibo (req, res) {
  const oa = sails.config.oauth.weibo;

  if (!oa) {
    return res.status(503).json({
      message: '暂不支持微博绑定',
    });
  }

  const auth = await SeqModels.Auth.create({
    site: 'weibo',
    owner: req.session.clientId,
    redirect: req.query ? req.query.redirect : '',
  });

  const callback = sails.config.globals.api + '/auth/weibo/callback';

  res.redirect(307, oa.getAuthorizeUrl({
    redirect_uri: callback,
    state: auth.id,
  }));
}

module.exports = weibo;
