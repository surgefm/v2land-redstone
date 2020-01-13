import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Default,
} from 'sequelize-typescript';

@Table({
  modelName: 'reportNotification',
  freezeTableName: true,
} as TableOptions)
class ReportNotification extends Model<ReportNotification> {
  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'complete', 'invalid'))
  status: string;
}

export default ReportNotification;
