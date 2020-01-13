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
  BelongsToMany,
} from 'sequelize-typescript';

import Event from './Event';
import Report from './Report';
import ReportNotification from './ReportNotification';

@Table({
  modelName: 'notification',
  freezeTableName: true,
} as TableOptions)
class Notification extends Model<Notification> {
  @AllowNull(false)
  @Default(new Date())
  @Column(DataType.DATE)
  time: Date;

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
  @Default('pending')
  @Column(DataType.ENUM('pending', 'ongoing', 'complete', 'discarded'))
  status: string;

  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @BelongsTo(() => Event, 'eventId')
  event: Event;

  @BelongsToMany(() => Report, () => ReportNotification, 'notificationId', 'reportId')
  reports: Report[];
}

export default Notification;
