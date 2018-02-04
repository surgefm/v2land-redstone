module.exports = {

  tweet: async (auth, status) => {
    const oa = sails.config.oauth.twitter;
    if (!oa) {
      throw new Error('不支持发布推文：Twitter 未配置齐全');
    }

    oa.post('https://api.twitter.com/1.1/statuses/update.json',
      auth.accessToken, auth.accessTokenSecret, { status }, (err) => {
        if (err) throw err;
        return;
      });
  },

};
