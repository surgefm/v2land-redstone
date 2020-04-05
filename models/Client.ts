import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Is,
  Unique,
  Default,
  HasMany,
} from 'sequelize-typescript';
import * as _ from 'lodash';

import Record from './Record';
import Auth from './Auth';
import Subscription from './Subscription';
import Contact from './Contact';
import Report from './Report';
import AuthorizationCode from './AuthorizationCode';
import AuthorizationAccessToken from './AuthorizationAccessToken';

@Table({
  modelName: 'client',
  freezeTableName: true,
} as TableOptions)
class Client extends Model<Client> {
  @Is('Username', (value) => {
    if (!_.isString(value) || value.length < 2 || value.length > 16) {
      throw new Error('用户名长度应在 2-16 个字符内');
    } else if (/\r?\n|\r| |@/.test(value)) {
      throw new Error('用户名不得含有 @ 或空格。');
    }

    let allDigit = true;
    for (const char of value) {
      if (!/\d/.test(char)) {
        allDigit = false;
        break;
      }
    }
    if (allDigit) {
      throw new Error('用户名不得全为数字');
    }
  })
  @AllowNull(false)
  @Unique(true)
  @Column(DataType.TEXT)
  username: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  email: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  password: string;

  @AllowNull(false)
  @Default('contributor')
  @Column(DataType.TEXT)
  role: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  emailVerified: boolean;

  @AllowNull(false)
  @Default({})
  @Column(DataType.JSONB)
  settings: any;

  @HasMany(() => Record, 'owner')
  records: Record[];

  @HasMany(() => Auth, 'owner')
  auths: Auth[];

  @HasMany(() => Subscription, 'subscriber')
  subscriptions: Subscription[];

  @HasMany(() => Contact, 'owner')
  contacts: Contact[];

  @HasMany(() => Report, 'owner')
  reports: Report[];

  @HasMany(() => AuthorizationCode, 'owner')
  authorizationCodes: AuthorizationCode[];

  @HasMany(() => AuthorizationAccessToken, 'owner')
  authorizationAccessTokens: AuthorizationAccessToken[];

  subscriptionCount?: number;
  isAdmin?: boolean;
  isManager?: boolean;
}

export default Client;
