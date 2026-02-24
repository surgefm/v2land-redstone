import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
  BelongsTo,
  AllowNull,
  IsUUID,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';

import Client from './Client';
import Chat from './Chat';

@Table({
  modelName: 'chatMember',
  freezeTableName: true,
} as TableOptions)
class ChatMember extends Model<ChatMember> {
  @IsUUID(4)
  @PrimaryKey
  @Column
  id: string;

  @AllowNull(false)
  @ForeignKey(() => Client)
  @Column
  clientId: number;

  @BelongsTo(() => Client, 'clientId')
  client: Client;

  @AllowNull(false)
  @ForeignKey(() => Chat)
  @Column(DataType.TEXT)
  chatId: string;

  @BelongsTo(() => Chat, 'chatId')
  chat: Chat;

  @Column(DataType.DATE)
  lastRead: Date;

  @Column(DataType.DATE)
  lastSpoke: Date;
}

export default ChatMember;
