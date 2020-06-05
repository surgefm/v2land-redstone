import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';
import { Client, Record as RecordModel, News, HeaderImage, Tag } from '@Models';
import { ResourceLockStatus } from '@Models/ResourceLock';
import { NotificationMode, NotificationModeInput } from './NotificationMode';
import RedstoneError, {
  RedstoneErrorIdentifier,
  InvalidInputErrorType, ResourceNotFoundErrorType,
} from './RedstoneError';

interface RedstoneRequest extends Request {
  sessionID?: string;
  currentClient?: Client;
  log: Logger;
}

type RedstoneResponse = Response
type ControllerAction = (req: RedstoneRequest, res: RedstoneResponse) => Promise<any>;

interface StringIndexInterface {
  [index: string]: any;
}

interface SimplifiedEventInterface extends StringIndexInterface {
  id?: number;
  headerImage?: number | { id?: number } | HeaderImage;
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
  stackEventId?: number;
  stackEvent?: EventObj;
}

interface EventObj extends SimplifiedEventInterface {
  name: string;
  description?: string;
  status?: string;
  stacks: StackObj[];
  tags?: Tag[];
  newsCount?: number;
  stackCount?: number;
  temporaryStack?: News[];
  lastUpdate?: Date;
  get?: Function;
}

interface ResourceLockObj {
  locker: number;
  eventId: number;
  model?: string;
  resourceId?: number;
}

export {
  RedstoneRequest,
  RedstoneResponse,
  NextFunction,
  ControllerAction,

  SimplifiedEventInterface,
  EventObj,
  StackObj,

  NotificationMode,
  NotificationModeInput,

  ResourceLockObj,
  ResourceLockStatus,

  RedstoneError,
  RedstoneErrorIdentifier,
  InvalidInputErrorType,
  ResourceNotFoundErrorType,
};
