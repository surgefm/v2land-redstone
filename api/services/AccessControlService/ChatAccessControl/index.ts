import * as ChatService from '@Services/ChatService';
import { Event } from '@Models';
import { isClientEditor } from '../RoleAccessControl';
import { isAllowedToViewEvent } from '../EventAccessControl';

export const isAllowedToTalkTo = async (authorId: number, ids: number[]) => {
  const isEditor = await isClientEditor(authorId);
  return isEditor || !!(await ChatService.getChat('client', [...ids, authorId]));
};

export const isAllowedToViewClientChat = async (clientId: number, ids: number[]) => {
  return ids.includes(clientId);
};

export const isAllowedToChatInNewsroom = async (authorId: number, eventId: number) => {
  return isAllowedToViewEvent(authorId, eventId);
};

export const isAllowedToViewNewsroomChat = async (authorId: number, eventId: number) => {
  const event = await Event.findByPk(Math.abs(+eventId));
  if (event.status === 'admitted') return true;
  return isAllowedToViewEvent(authorId, eventId);
};
