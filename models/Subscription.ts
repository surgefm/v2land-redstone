import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';

import Event from './Event';
import Client from './Client';
import Contact from './Contact';

@Table({
  modelName: 'subscription',
  freezeTableName: true,
} as TableOptions)
class Subscription extends Model<Subscription> {
  @AllowNull(false)
  @Column(DataType.ENUM(
    'EveryNewStack',
    '30DaysSinceLatestStack',
    'new', '7DaysSinceLatestNews',
    'daily', 'weekly', 'monthly',
    'EveryFriday',
  ))
  mode: string;

  @AllowNull(false)
  @Default('active')
  @Column(DataType.ENUM('active', 'unsubscribed'))
  status: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  unsubscribeId: string;

  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @BelongsTo(() => Event, 'eventId')
  event: Event;

  @ForeignKey(() => Client)
  @Column
  subscriber: number;

  @BelongsTo(() => Client, 'subscriber')
  subscribedBy: Client;

  @HasMany(() => Contact, 'subscriptionId')
  contacts: Contact[];
}

export default Subscription;
