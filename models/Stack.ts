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
  BelongsToMany,
} from 'sequelize-typescript';

import Event from './Event';
import News from './News';
import EventStackNews from './EventStackNews';
import Record from './Record';

@Table({
  modelName: 'stack',
  freezeTableName: true,
} as TableOptions)
class Stack extends Model<Stack> {
  @AllowNull(false)
  @Column(DataType.TEXT)
  title: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'admitted', 'invalid', 'rejected', 'hidden', 'removed'))
  status: string;

  @AllowNull(false)
  @Default(-1)
  @Column(DataType.INTEGER)
  order: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  time: Date;

  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @BelongsTo(() => Event, 'eventId')
  event: Event;

  @BelongsToMany(() => News, () => EventStackNews)
  news: (News & {EventStackNews: EventStackNews})[];

  @HasMany(() => EventStackNews)
  eventStackNews: EventStackNews[];

  newsCount?: number;
  contribution?: Record[];
}

export default Stack;
