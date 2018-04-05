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

  async sendNewsAdmitted(news, handler) {
    try {
      const submitRecord = await Record.findOne({
        model: 'News',
        action: 'createNews',
        target: news.id,
      });

      if (!submitRecord) {
        throw new Error('Record is not exist');
      }

      const username = submitRecord.client.username || '游客';

      const content =
        `*${ username }*提交的新闻` +
        `「[${ event.name }](https://langchao.org/${ event.id }/${ event.name }) 」` +
        `被管理员*${ handler.username }*审核通过了，进来看看吧！`;
      await this.sendText(content, 'Markdown');
    } catch (err) {
      sails.log.error(new Error(`Telegram sendNews: ${ err }`));
    }
  },

  async sendEventAdmitted(event, handler) {
    try {
      const submitRecord = await Record.findOne({
        model: 'Event',
        action: 'createEvent',
        target: event.id,
      });

      if (!submitRecord) {
        throw new Error('Record is not exist');
      }

      const username = submitRecord.client.username || '游客';

      const content =
        `*${ username }*提交的事件` +
        `「[${ event.name }](https://langchao.org/${ event.id }/${ event.name }) 」` +
        `被管理员*${ handler.username }*审核通过了，进来看看吧！`;
      await this.sendText(content, 'Markdown');
    } catch (err) {
      sails.log.error(new Error(`Telegram sendEvent: ${ err }`));
    }
  },

  async sendAdminEvent(event, handler) {
    try {
      const username = handler.username || '游客';

      const content =
        `管理员*${ username }*提交了事件` +
        `「[${ event.name }](https://langchao.org/${ event.id }/${ event.name }) 」` +
        `，进来看看吧！`;
      await this.sendText(content, 'Markdown');
    } catch (err) {
      sails.log.error(new Error(`Telegram sendEvent: ${ err }`));
    }
  },

};
