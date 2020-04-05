import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';
import { Client, Record as RecordModel, Stack, News } from '@Models';
import { Sequelize } from 'sequelize-typescript';
import { NotificationMode, NotificationModeInput } from './NotificationMode';

interface RedstoneRequest extends Request {
  sessionID?: string;
  currentClient?: Client;
  log: Logger;
}

interface RedstoneResponse extends Response {}
interface RedstoneNextFunction extends NextFunction {}
type ControllerAction = (req: RedstoneRequest, res: RedstoneResponse) => Promise<any>;

interface StringIndexInterface {
  [index: string]: any
}

interface SimplifiedEventInterface extends StringIndexInterface {
  id?: number;
  headerImage?: number | { id?: number };
  contribution?: RecordModel[];
}

interface StackObj {
  id?: number;
  title?: string;
  description?: string;
  newsCount?: number;
  status?: string;
  news?: News[];
  order?: number;
  time?: Date;
  contribution?: RecordModel[];
  enableNotification?: boolean;
  eventId?: number;
  event?: EventObj;
}

interface EventObj extends SimplifiedEventInterface {
  name: string;
  description?: string;
  status?: string;
  stacks: StackObj[];
  newsCount?: number;
  stackCount?: number;
  temporaryStack?: News[];
  lastUpdate?: Date;
  get?: Function;
}

declare let sequelize: Sequelize;

export {
  RedstoneRequest,
  RedstoneResponse,
  NextFunction,
  ControllerAction,
  SimplifiedEventInterface,
  EventObj,
  StackObj,
  sequelize,
  NotificationMode,
  NotificationModeInput,
};
