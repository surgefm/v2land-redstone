import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Default,
  IsUrl,
  Length,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import Event from './Event';
import Stack from './Stack';
import Record from './Record';

@Table({
  modelName: 'news',
  freezeTableName: true,
} as TableOptions)
class News extends Model<News> {
  @IsUrl
  @AllowNull(false)
  @Column(DataType.TEXT)
  url: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  source: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  title: string;

  @Length({ min: 2, max: 203 })
  @AllowNull(false)
  @Column(DataType.TEXT)
  abstract: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  time: Date;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'admitted', 'rejected', 'removed'))
  status: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  comment?: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isInTemporaryStack: boolean;

  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @BelongsTo(() => Event, 'eventId')
  event: Event;

  @ForeignKey(() => Stack)
  @Column
  stackId: number;

  @BelongsTo(() => Stack, 'stackId')
  stack: Stack;

  contribution?: Record[];
}

export default News;
