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

@Table({
  modelName: 'auth',
  freezeTableName: true,
} as TableOptions)
class Auth extends Model<Auth> {
  @AllowNull(false)
  @Column(DataType.ENUM('twitter', 'weibo', 'email', 'google', 'telegram', 'github'))
  site: string;

  @Column(DataType.TEXT)
  inviteCode?: string;

  @Column(DataType.TEXT)
  profileId?: string; // 微博/Twitter 的用户 uid

  @Column(DataType.JSONB)
  profile?: any;

  @Column(DataType.TEXT)
  token?: string;

  @Column(DataType.TEXT)
  tokenSecret?: string;

  @Column(DataType.TEXT)
  accessToken?: string;

  @Column(DataType.TEXT)
  accessTokenSecret?: string;

  @Column(DataType.TEXT)
  refreshToken?: string;

  @Column(DataType.TEXT)
  redirect?: string;

  @ForeignKey(() => Client)
  @Column(DataType.INTEGER)
  owner: number;

  @BelongsTo(() => Client, 'owner')
  ownedBy: Client;
}

export default Auth;
