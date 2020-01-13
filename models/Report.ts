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

import Client from './Client';
import Notification from './Notification';
import ReportNotification from './ReportNotification';

@Table({
  modelName: 'report',
  freezeTableName: true,
} as TableOptions)
class Report extends Model<Report> {
  @AllowNull(false)
  @Default(new Date())
  @Column(DataType.DATE)
  time: Date;

  @AllowNull(false)
  @Default('daily')
  @Column(DataType.ENUM('daily', 'weekly', 'monthly'))
  type: string;

  @AllowNull(false)
  @Default('email')
  @Column(DataType.ENUM('email', 'telegram'))
  method: string;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'ongoing', 'complete', 'invalid'))
  status: string;

  @ForeignKey(() => Client)
  @Column
  owner: number;

  @BelongsTo(() => Client, 'owner')
  ownedBy: Client;

  @BelongsToMany(() => Notification, () => ReportNotification, 'reportId', 'notificationId')
  notifications: Notification[];
}

export default Report;
