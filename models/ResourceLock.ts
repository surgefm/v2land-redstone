import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  ForeignKey,
  BelongsTo, Default,
} from 'sequelize-typescript';

import Client from './Client';
import Event from './Event';

export enum ResourceLockStatus {
  ACTIVE = 'active',
  UNLOCKED = 'unlocked',
  EXPIRED = 'expired',
}

@Table({
  modelName: 'resourceLock',
  freezeTableName: true,
} as TableOptions)
class ResourceLock extends Model<ResourceLock> {
  @AllowNull(false)
  @Column(DataType.TEXT)
  model: string; // event, stack, news

  @Column(DataType.INTEGER)
  resourceId: number;

  @Column(DataType.DATE)
  expires: Date;

  @AllowNull(false)
  @Default(ResourceLockStatus.ACTIVE)
  @Column(DataType.ENUM('active', 'unlocked', 'expired'))
  status: string;

  @ForeignKey(() => Client)
  @Column(DataType.INTEGER)
  locker: number;

  @BelongsTo(() => Client, 'locker')
  lockedBy: Client;

  @ForeignKey(() => Event)
  @Column(DataType.INTEGER)
  eventId: number;

  @BelongsTo(() => Event, 'eventId')
  event: Event;
}

export default ResourceLock;
