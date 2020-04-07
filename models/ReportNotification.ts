import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Default,
  ForeignKey,
} from 'sequelize-typescript';
import Report from './Report';
import Notification from './Notification';

@Table({
  modelName: 'reportNotification',
  freezeTableName: true,
} as TableOptions)
class ReportNotification extends Model<ReportNotification> {
  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'complete', 'invalid'))
  status: string;

  @ForeignKey(() => Report)
  @Column
  reportId: number;

  @ForeignKey(() => Notification)
  @Column
  notificationId: number;
}

export default ReportNotification;
