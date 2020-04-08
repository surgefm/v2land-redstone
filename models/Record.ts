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
  /**
    'Event',
    'Stack',
    'News',
    'Client',
    'HeaderImage',
    'Subscription',
    'Contact',
    'Auth',
    'Report',
    'Miscellaneous'
  */
  @AllowNull(false)
  @Column(DataType.TEXT)
  model: string;

  @Column(DataType.INTEGER)
  target?: number;

  /**
   * In the case of a through model, there are two target resources.
   * The model with higher priority would be `target`, the other `subtarget`.
   * Priority: Event > Stack > News
   */
  @AllowNull
  @Column(DataType.INTEGER)
  subtarget?: number;

  @Column(DataType.ENUM(
    'create',
    'update',
    'destroy',
  ))
  operation?: string;

  /**
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
    'sendMonthlyDailyReport'
    'createTag',
    'addTagToEvent',
    'removeTagFromEvent'
  */
  @Column(DataType.TEXT)
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
