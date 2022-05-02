import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
  BelongsTo,
  AllowNull,
  DataType,
  IsUUID,
  PrimaryKey,
} from 'sequelize-typescript';

import Client from './Client';
import Chat from './Chat';

@Table({
  modelName: 'chatMessage',
  freezeTableName: true,
} as TableOptions)
class ChatMessage extends Model<ChatMessage> {
  @IsUUID(4)
  @PrimaryKey
  @Column
  id: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  text: string;

  @AllowNull(false)
  @ForeignKey(() => Client)
  @Column
  authorId: number;

  @BelongsTo(() => Client, 'authorId')
  author: Client;

  @AllowNull(false)
  @ForeignKey(() => Chat)
  @Column(DataType.TEXT)
  chatId: string;

  @BelongsTo(() => Chat, 'chatId')
  chat: Chat;
}

export default ChatMessage;
