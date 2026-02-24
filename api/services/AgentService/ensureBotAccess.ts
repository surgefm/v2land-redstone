import * as AccessControlService from '../AccessControlService';
import * as ChatService from '../ChatService';
import { getOrCreateBotClient } from './botClient';

export async function ensureBotAccess(eventId: number): Promise<boolean> {
  const botClient = await getOrCreateBotClient();

  const hasAccess = await AccessControlService.isAllowedToEditEvent(botClient.id, eventId);
  if (hasAccess) return true;

  await ChatService.sendMessage(
    'newsroom',
    botClient.id,
    '我没有编辑此时间线的权限。请在编辑室中将 @Bot 添加为编辑者。',
    eventId,
  );

  return false;
}
