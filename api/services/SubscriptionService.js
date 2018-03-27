const uniqueString = require('unique-string');

module.exports = {

  generateUnsubscribeId: () => {
    return uniqueString();
  },

};
