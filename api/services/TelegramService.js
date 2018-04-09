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

  sendText(text, parseMode, disableWebPagePreview) {
    let chatId;
    if (sails.config.environment === 'production') {
      chatId = sails.config.globals.telegramReviewChatId;
    } else {
      chatId = sails.config.globals.telegramTestChatId;
    }
    return this.sendMessage(
      chatId,
      text,
      parseMode,
      disableWebPagePreview
    );
  },

  async sendNewsAdmitted(news, handler) {
    try {
      const submitRecord = await Record.findOne({
        model: 'News',
        action: 'createNews',
        target: news.id,
      }).populate('client');

      if (!submitRecord) {
        throw new Error('Record is not exist');
      }

      const username = (submitRecord.client && submitRecord.client.username)
        ? submitRecord.client.username
        : '游客';

      const content =
        `*${ username }*提交的新闻` +
        `「[${ news.title }](${ sails.config.globals.site }/${ news.event.id }/${ news.id }) 」` +
        `被管理员*${ handler.username }*审核通过了，进来看看吧！`;
      await this.sendText(content, 'Markdown');
    } catch (err) {
      sails.log.error(new Error(`Telegram sendNewsAdmitted: ${ err }`));
    }
  },

  async sendNewsRejected(news, handler) {
    try {
      const submitRecord = await Record.findOne({
        model: 'News',
        action: 'createNews',
        target: news.id,
      }).populate('client');

      if (!submitRecord) {
        throw new Error('Record is not exist');
      }

      const username = (submitRecord.client && submitRecord.client.username)
        ? submitRecord.client.username
        : '游客';

      const content =
        `*${username}*提交的新闻` +
        `「${news.title}」被管理员*${handler.username}*拒绝了，` +
        `如有疑虑请咨询任一社区管理员。`;

      await this.sendText(content, 'Markdown');
    } catch (err) {
      sails.log.error(new Error(`Telegram sendNewsRejected: ${err}`));
    }
  },

  async sendNewsCreated(event, news, handler) {
    try {
      const username = (handler && handler.username) || '游客';

      const content =
        `*${ username }*为事件*${ event.name }*提交了新闻` +
        `「[${ news.title }](${ sails.config.globals.site }/${ event.id }/admit) 」` +
        `，请管理员尽快审核`;
      await this.sendText(content, 'Markdown', true);
    } catch (err) {
      sails.log.error(new Error(`Telegram sendNewsCreated: ${ err }`));
    }
  },

  async sendEventAdmitted(event, handler) {
    try {
      const submitRecord = await Record.findOne({
        model: 'Event',
        action: 'createEvent',
        target: event.id,
      }).populate('client');

      if (!submitRecord) {
        throw new Error('Record is not exist');
      }

      const username = (submitRecord.client && submitRecord.client.username)
        ? submitRecord.client.username
        : '游客';

      const content =
        `*${ username }*提交的事件` +
        `「[${ event.name }](${ sails.config.globals.site }/${ event.id }/${ event.name }) 」` +
        `被管理员*${ handler.username }*审核通过了，进来看看吧！`;
      await this.sendText(content, 'Markdown');
    } catch (err) {
      sails.log.error(new Error(`Telegram sendEventAdmitted: ${ err }`));
    }
  },

  async sendEventRejected(event, handler) {
    try {
      const submitRecord = await Record.findOne({
        model: 'Event',
        action: 'createEvent',
        target: event.id,
      }).populate('client');

      if (!submitRecord) {
        throw new Error('Record is not exist');
      }

      const username = (submitRecord.client && submitRecord.client.username)
        ? submitRecord.client.username
        : '游客';

      const content =
        `*${username}*提交的事件「${event.name}」` +
        `被管理员*${handler.username}*拒绝了，如有疑惑请联系任一社区管理员`;
      await this.sendText(content, 'Markdown');
    } catch (err) {
      sails.log.error(new Error(`Telegram sendEventRejected: ${err}`));
    }
  },

  async sendEventCreated(event, handler) {
    try {
      const username = (handler && handler.username) || '游客';

      const content =
        `*${username}*提交了事件*「${event.name}*」` +
        `，请管理员尽快[审核](${sails.config.globals.site }/admin/admit)`;
      await this.sendText(content, 'Markdown', true);
    } catch (err) {
      sails.log.error(new Error(`Telegram sendEventCreated: ${err}`));
    }
  },

  async sendAdminEvent(event, handler) {
    try {
      const username = handler.username || '游客';

      const content =
        `管理员*${ username }*提交了事件` +
        `「[${ event.name }](${ sails.config.globals.site }/${ event.id }/${ event.name }) 」` +
        `，进来看看吧！`;
      await this.sendText(content, 'Markdown');
    } catch (err) {
      sails.log.error(new Error(`Telegram sendEvent: ${ err }`));
    }
  },

};
