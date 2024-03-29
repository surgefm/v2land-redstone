/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios';
import { globals } from '@Configs';

export const { TELE_TOKEN } = process.env;

/**
 * reference: https://core.telegram.org/bots/api#sendmessage
 */
export async function sendMessage(
  chatId: string,
  text: string,
  parseMode = 'Markdown',
  disableWebPagePreview = false,
  disableNotification= false,
  replyToMessageId?: string,
  replyMarkup?: string,
  notifyMissingToken = false,
) {
  if (!TELE_TOKEN && notifyMissingToken) {
    throw new Error('Environment Variable for TelegramService \'TELE_TOKEN\' undefined');
  }

  if (
    notifyMissingToken && (
      typeof chatId === 'undefined' ||
      typeof text === 'undefined'
    )
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

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${ TELE_TOKEN }/sendMessage`,
      JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response;
  } catch (err) {
    console.error('Error sending telegram message', err);
  }
}

export async function sendText(text: string, parseMode?: string, disableWebPagePreview?: boolean) {
  const chatId = globals.telegramReviewChatId;
  if (globals.environment !== 'production') {
    return;
  }
  return sendMessage(
    chatId,
    text,
    parseMode,
    disableWebPagePreview
  );
}
