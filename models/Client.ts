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
  BelongsToMany,
} from 'sequelize-typescript';
import _ from 'lodash';

import Record from './Record';
import Auth from './Auth';
import Subscription from './Subscription';
import Contact from './Contact';
import Report from './Report';
import AuthorizationCode from './AuthorizationCode';
import AuthorizationAccessToken from './AuthorizationAccessToken';
import Tag from './Tag';
import TagCurator from './TagCurator';

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
      if (!/[a-zA-Z0-9]/.test(char)) {
        throw new Error('用户名不得含有除 a-z，A-Z，0-9 外的字符');
      }
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

  @Is('Nickname', (value) => {
    if (!_.isString(value) || value.length < 2 || value.length > 16) {
      throw new Error('昵称长度应在 2-16 个字符内');
    } else if (/\r?\n|\r|@|%/.test(value)) {
      throw new Error('昵称不得含有 @ 或 %。');
    }

    let allDigit = true;
    for (const char of value) {
      if (!/\d/.test(char)) {
        allDigit = false;
        break;
      }
    }
    if (allDigit) {
      throw new Error('昵称不得全为数字');
    }
  })
  @AllowNull(false)
  @Unique(false)
  @Column(DataType.TEXT)
  nickname: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  email: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  password: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  avatar: string;

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

  @BelongsToMany(() => Tag, () => TagCurator)
  tags: Array<Tag & {tagCurator: TagCurator}>;

  subscriptionCount?: number;
  isAdmin?: boolean;
  isEditor?: boolean;
}

export default Client;
