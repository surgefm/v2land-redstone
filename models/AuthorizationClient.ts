import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Default,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import Client from './Client';
import AuthorizationCode from './AuthorizationCode';
import AuthorizationAccessToken from './AuthorizationAccessToken';

@Table({
  modelName: 'authorizationClient',
  freezeTableName: true,
} as TableOptions)
class AuthorizationClient extends Model<AuthorizationClient> {
  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  redirectURI: string;

  @Default(false)
  @Column
  allowAuthorizationByCredentials: boolean;

  @AllowNull(true)
  @Column(DataType.TEXT)
  secret?: string;

  @AllowNull(true)
  @ForeignKey(() => Client)
  @Column
  owner?: number;

  @BelongsTo(() => Client, 'owner')
  ownedBy?: Client;

  @HasMany(() => AuthorizationCode, 'authorizationClientId')
  authorizationCodes: AuthorizationCode[];

  @HasMany(() => AuthorizationAccessToken, 'authorizationClientId')
  authorizationAccessTokens: AuthorizationAccessToken[];
}

export default AuthorizationClient;
