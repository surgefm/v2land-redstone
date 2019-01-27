function options (req, res) {
  res.status(200).json({
    twitter: sails.config.oauth.twitter ? true : false,
    weibo: sails.config.oauth.weibo ? true : false,
  });
}

module.exports = options;
