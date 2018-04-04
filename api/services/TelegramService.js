const axios = require('axios');

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

    return axios.post(
      `https://api.telegram.org/bot${ TELE_TOKEN }/sendMessage`,
      JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },

  sendText(text, parseMode) {
    let chatId;
    if (sails.config.environment === 'production') {
      chatId = '@langchao';
    } else {
      chatId = '@langchao_notification_test';
    }
    return this.sendMessage(
      chatId,
      text,
      parseMode
    );
  },

  async sendEvent(event) {
    try {
      await this.sendText(
        `有新的事件通过了审核，进来看看吧：[${ event.name }](https://langchao.org/${ event.name })`,
        'Markdown'
      );
    } catch (err) {
      sails.log.error(new Error(`Telegram sendEvent: ${ err }`));
    }
  },

};
