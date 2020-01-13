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
} from 'sequelize-typescript';

import Client from './Client';
import AuthorizationClient from './AuthorizationClient';

@Table({
  modelName: 'authorizationAccessToken',
  freezeTableName: true,
} as TableOptions)
class AuthorizationAccessToken extends Model<AuthorizationAccessToken> {
  @AllowNull(false)
  @Column(DataType.TEXT)
  token: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  refreshToken?: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  expire: Date;

  @Default('active')
  @Column(DataType.ENUM('active', 'revoked'))
  status: string;

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

export default AuthorizationAccessToken;
