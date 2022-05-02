import { EventObj } from '@Types';
import notifyWhenEventCreated from './notifyWhenEventCreated';
import notifyWhenEventStatusChanged from './notifyWhenEventStatusChanged';
import notifyWhenNewsCreated from './notifyWhenNewsCreated';
import notifyWhenNewsStatusChanged from './notifyWhenNewsStatusChanged';
import notifyWhenStackStatusChanged from './notifyWhenStackStatusChanged';
import updateNewsNotifications from './updateNewsNotifications';
import updateStackNotifications from './updateStackNotifications';
import * as ModeService from '../ModeService';

async function getNextTime(mode: string, event: EventObj) {
  return ModeService.getMode(mode).new({ event });
}

async function notified(mode: string, event: EventObj) {
  return ModeService.getMode(mode).notified({ event });
}

export {
  notifyWhenEventCreated,
  notifyWhenEventStatusChanged,
  notifyWhenNewsCreated,
  notifyWhenNewsStatusChanged,
  notifyWhenStackStatusChanged,
  updateNewsNotifications,
  updateStackNotifications,
  getNextTime,
  notified,
};
