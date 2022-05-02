import { Chat, ChatMember } from '@Models';
import { BroadcastOperator } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { loadSocket } from '~/sockets';

export const getNewsroomChatId = (eventId: number) => {
  return `newsroom-chat:${eventId}`;
};

export const getClientChatId = (...clientIds: number[]) => {
  const ids = clientIds.sort();
  return `client-chat:${ids.join('-')}`;
};

export const getChatId = (type: 'client' | 'newsroom', ids: number | number[]) => {
  if (type === 'client') return getClientChatId(...ids as number[]);
  return getNewsroomChatId(ids as number);
};


export function getChat(type: 'client', ...clientIds: number[]): Promise<Chat>;
export function getChat(type: 'newsroom', eventId: number): Promise<Chat>;
export async function getChat(type: 'client' | 'newsroom', ...ids: number[]) {
  if (type === 'client') {
    return Chat.findByPk(getClientChatId(...ids));
  }
  return Chat.findByPk(getNewsroomChatId(ids[0]));
}


export function getOrCreateChat(type: 'client', clientIds: number[]): Promise<Chat>;
export function getOrCreateChat(type: 'newsroom', eventId: number): Promise<Chat>;
export async function getOrCreateChat(type: 'client' | 'newsroom', ids: number | number[]) {
  if (type === 'client') {
    const _ids = ids as number[];
    const clientChatId = getClientChatId(..._ids);
    const exist = await Chat.findByPk(clientChatId);
    if (exist) return exist;
    const newChat = await Chat.create({
      id: clientChatId,
    });
    await Promise.all(_ids.map(id => ChatMember.create({
      chatId: clientChatId,
      clientId: id,
    })));
    return newChat;
  } else if (type === 'newsroom') {
    const eventId = ids as number;
    const newsroomChatId = getNewsroomChatId(eventId);
    const exist = await Chat.findByPk(newsroomChatId);
    if (exist) return exist;
    return Chat.create({
      id: newsroomChatId,
      eventId,
    });
  }
}


export function getChatSocket(type: 'client', clientIds: number[]): Promise<BroadcastOperator<DefaultEventsMap, any>>;
export function getChatSocket(type: 'newsroom', eventId: number): Promise<BroadcastOperator<DefaultEventsMap, any>>;
export function getChatSocket(chatId: string): Promise<BroadcastOperator<DefaultEventsMap, any>>;
export async function getChatSocket(type: 'client' | 'newsroom' | string, ids?: number | number[]) {
  const server = await loadSocket();
  if (type === 'client') {
    return server.in(getClientChatId(...(ids as number[])));
  } else if (type === 'newsroom') {
    return server.in(getNewsroomChatId(ids as number));
  }
  return server.in(type);
}
