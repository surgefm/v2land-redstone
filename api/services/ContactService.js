module.exports = {

  getTypeFromMethod: (method) => {
    switch (method) {
    case 'twitterAt':
      return 'twitter';
    case 'weiboAt':
      return 'weibo';
    default:
      return method;
    }
  },

};
