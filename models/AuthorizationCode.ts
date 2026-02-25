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
import AuthorizationClient from './AuthorizationClient';

@Table({
  modelName: 'authorizationCode',
  freezeTableName: true,
} as TableOptions)
class AuthorizationCode extends Model<AuthorizationCode> {
  @Column(DataType.TEXT)
  code?: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  expire: Date;

  @AllowNull(false)
  @Column(DataType.TEXT)
  url: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  codeChallenge?: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  codeChallengeMethod?: string;

  @ForeignKey(() => Client)
  @Column
  owner: number;

  @BelongsTo(() => Client, 'owner')
  ownedBy: Client;

  @ForeignKey(() => AuthorizationClient)
  @Column
  authorizationClientId: number;

  @BelongsTo(() => AuthorizationClient, 'authorizationClientId')
  authorizationClient: AuthorizationClient;
}

export default AuthorizationCode;
