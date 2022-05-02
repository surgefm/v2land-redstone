import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
  HasOne,
  HasMany,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';

import Client from './Client';
import Event from './Event';

@Table({
  modelName: 'chat',
  freezeTableName: true,
} as TableOptions)
class Chat extends Model<Chat> {
  @PrimaryKey
  @Column(DataType.TEXT)
  id: string;

  @HasMany(() => Client, 'chatId')
  members: Client[];

  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @HasOne(() => Event, 'eventId')
  event: Event;
}

export default Chat;
