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
import Event from './Event';

@Table({
  modelName: 'commit',
  freezeTableName: true,
} as TableOptions)
class Commit extends Model<Commit> {
  @Column(DataType.TEXT)
  summary: string;

  @AllowNull
  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.JSONB)
  data: Event;

  @Column(DataType.JSONB)
  diff: any;

  @Column(DataType.TIME)
  time: Date;

  @ForeignKey(() => Commit)
  @Column
  parentId: number;

  @BelongsTo(() => Commit, 'parentId')
  parent: Commit;

  @ForeignKey(() => Client)
  @Column
  authorId: number;

  @BelongsTo(() => Client, 'authorId')
  author: Client;

  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @BelongsTo(() => Event, 'eventId')
  event: Event;
}

export default Commit;
