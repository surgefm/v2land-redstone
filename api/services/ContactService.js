module.exports = {

  getTypeFromMethod: (method) => {
    switch (method) {
    case 'emailDailyReport':
      return 'email';
    case 'twitterAt':
      return 'twitter';
    case 'weiboAt':
      return 'weibo';
    default:
      return method;
    }
  },

};
