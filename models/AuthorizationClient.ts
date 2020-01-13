import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Default,
  HasMany,
} from 'sequelize-typescript';

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
  
  @HasMany(() => AuthorizationCode, 'authorizationClientId')
  authorizationCodes: AuthorizationCode[];

  @HasMany(() => AuthorizationAccessToken, 'authorizationClientId')
  authorizationAccessTokens: AuthorizationAccessToken[];
}

export default AuthorizationClient;
