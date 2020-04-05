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
    if (!_.isString(value) || value.length < 2 || value.length > 16) return false;
    if (/\r?\n|\r| |@/.test(value)) return false;

    let allDigit = true;
    for (const char of value) {
      if (!/\d/.test(char)) {
        allDigit = false;
        break;
      }
    }
    return !allDigit;
  })
  @AllowNull(false)
  @Unique(true)
  @Column(DataType.TEXT)
  username: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  email: string;

  @Is('Password', (value) => {
    return _.isString(value) && value.length >= 6 && value.match(/[A-z]/i) && value.match(/[0-9]/);
  })
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
