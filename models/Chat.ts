import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
  HasMany,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';

import Event from './Event';
import ChatMember from './ChatMember';

@Table({
  modelName: 'chat',
  freezeTableName: true,
} as TableOptions)
class Chat extends Model<Chat> {
  @PrimaryKey
  @Column(DataType.TEXT)
  id: string;

  @HasMany(() => ChatMember)
  members: ChatMember[];

  @ForeignKey(() => Event)
  @Column
  eventId: number;
}

export default Chat;
