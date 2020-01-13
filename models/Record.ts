import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import Client from './Client';

@Table({
  modelName: 'record',
  freezeTableName: true,
} as TableOptions)
class Record extends Model<Record> {
  @AllowNull(false)
  @Column(DataType.ENUM(
    'Event',
    'Stack',
    'News',
    'Client',
    'HeaderImage',
    'Subscription',
    'Contact',
    'Auth',
    'Report',
    'Miscellaneous',
  ))
  model: string;

  @Column(DataType.INTEGER)
  target?: number;

  @Column(DataType.ENUM(
    'create',
    'update',
    'destroy',
  ))
  operation?: string;

  @Column(DataType.ENUM(
    'createEvent',
    'updateEventStatus',
    'updateEventDetail',
    'createEventHeaderImage',
    'updateEventHeaderImage',
    'createStack',
    'updateStackStatus',
    'updateStackDetail',
    'invalidateStack',
    'notifyNewStack',
    'createNews',
    'updateNewsStatus',
    'updateNewsDetail',
    'notifyNewNews',
    'createSubscription',
    'updateSubscription',
    'cancelSubscription',
    'addContactToSubscription',
    'removeSubscriptionContact',
    'createClient',
    'updateClientRole',
    'updateClientDetail',
    'updateClientPassword',
    'createClientVerificationToken',
    'authorizeThirdPartyAccount',
    'unauthorizeThirdPartyAccount',
    'notify',
    'sendEmailDailyReport',
    'sendWeeklyDailyReport',
    'sendMonthlyDailyReport',
  ))
  action?: string;

  @Column(DataType.JSONB)
  before?: any;

  @Column(DataType.JSONB)
  data?: any;

  @ForeignKey(() => Client)
  @Column
  owner: number;

  @BelongsTo(() => Client, 'owner')
  ownedBy: Client;
}

export default Record;
