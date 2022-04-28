import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  BelongsTo,
  ForeignKey,
  Unique,
} from 'sequelize-typescript';

import Client from './Client';

@Table({
  modelName: 'inviteCode',
  freezeTableName: true,
} as TableOptions)
class InviteCode extends Model<InviteCode> {
  @Unique
  @Column(DataType.TEXT)
  code: string;

  @ForeignKey(() => Client)
  @Column(DataType.INTEGER)
  ownerId: number;

  @BelongsTo(() => Client, 'ownerId')
  owner: Client;

  @ForeignKey(() => Client)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => Client, 'userId')
  user: Client;
}

export default InviteCode;
