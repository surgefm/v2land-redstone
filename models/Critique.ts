import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Default,
  Length,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import Event from './Event';

@Table({
  modelName: 'critique',
  freezeTableName: true,
} as TableOptions)
class Critique extends Model<Critique> {
  @AllowNull(false)
  @Column(DataType.TEXT)
  url: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  source: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  title: string;

  @Length({ min: 2, max: 200 })
  @AllowNull(false)
  @Column(DataType.TEXT)
  abstract: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  time: Date;

  @Default('pending')
  @Column(DataType.ENUM('pending', 'admitted', 'rejected', 'removed'))
  status: string;

  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @BelongsTo(() => Event)
  event: Event;
}

export default Critique;
