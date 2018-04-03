const fetch = require('node-fetch');

const { TELE_TOKEN } = process.env;

module.exports = {

  /**
   * reference: https://core.telegram.org/bots/api#sendmessage
   */
  sendMessage(
    chatId,
    text,
    parseMode,
    disableWebPagePreview,
    disableNotification,
    replyToMessageId,
    replyMarkup
  ) {
    if (
      typeof chatId === 'undefined' ||
      typeof text === 'undefined'
    ) {
      throw new TypeError(`params chatId of text is undefined`);
    }

    const data = {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: disableWebPagePreview,
      disable_notification: disableNotification,
      reply_to_message_id: replyToMessageId,
      reply_markup: replyMarkup,
    };

    return fetch(`https://api.telegram.org/bot${ TELE_TOKEN }/sendMessage`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },

  sendText(text) {
    return this.sendMessage('@langchao', text);
  },

};
