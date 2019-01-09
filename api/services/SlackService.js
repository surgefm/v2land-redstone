const axios = require('axios');
const { SLACK_URL } = process.env;

module.exports = {

  sendText(text) {
    if (sails.config.environment !== 'production') {
      console.log('send slack', {
        text,
        parseMode,
      });
      return;
    }
    return axios.post(
      SLACK_URL,
      JSON.stringify({
        text,
      }), {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },

};
