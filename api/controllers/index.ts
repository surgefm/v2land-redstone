import * as AuthController from './AuthController';
import * as ChatController from './ChatController';
import * as ClientController from './ClientController';
import * as EventController from './EventController';
import * as HeaderImageController from './HeaderImageController';
import * as NewsController from './NewsController';
import * as NotificationController from './NotificationController';
import * as OAuth2Controller from './OAuth2Controller';
import * as RoleController from './RoleController';
import * as SearchController from './SearchController';
import * as StackController from './StackController';
import * as SubscriptionController from './SubscriptionController';
import * as TagController from './TagController';
import * as UploadController from './UploadController';
import { ControllerAction } from '@Types';

export type ControllerType = typeof AuthController | typeof ClientController |
  typeof EventController | typeof HeaderImageController | typeof NewsController |
  typeof NotificationController | typeof OAuth2Controller | typeof SearchController |
  typeof StackController | typeof SubscriptionController | typeof TagController |
  typeof UploadController | typeof RoleController | typeof ChatController;

export {
  AuthController,
  ChatController,
  ClientController,
  EventController,
  HeaderImageController,
  NewsController,
  NotificationController,
  OAuth2Controller,
  RoleController,
  SearchController,
  StackController,
  SubscriptionController,
  TagController,
  UploadController,
};

export default {
  AuthController,
  ChatController,
  ClientController,
  EventController,
  HeaderImageController,
  NewsController,
  NotificationController,
  OAuth2Controller,
  RoleController,
  SearchController,
  StackController,
  SubscriptionController,
  TagController,
  UploadController,
} as { [index: string]: { [index: string]: ControllerAction } };
