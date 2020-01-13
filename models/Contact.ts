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
import Subscription from './Subscription';
import Auth from './Auth';

@Table({
  modelName: 'contact',
  freezeTableName: true,
} as TableOptions)
class Contact extends Model<Contact> {
  @Column(DataType.TEXT)
  profileId?: string;

  @AllowNull(false)
  @Column(DataType.ENUM(
    'email',
    'twitter',
    'weibo',
    'telegram',
    'mobileApp',
  ))
  type: string;

  @AllowNull(false)
  @Column(DataType.ENUM(
    'twitter',
    'weibo',
    'twitterAt',
    'weiboAt',
    'email',
    'emailDailyReport',
    'mobileAppNotification',
  ))
  method: string;

  @Default('active')
  @AllowNull(false)
  @Column(DataType.ENUM('active', 'inactive', 'expired'))
  status: string;

  @Column(DataType.TEXT)
  unsubscribeId?: string;

  @ForeignKey(() => Client)
  @Column
  owner: number;

  @BelongsTo(() => Client, 'owner')
  ownedBy: Client;

  @ForeignKey(() => Subscription)
  @Column
  subscriptionId: number;

  @BelongsTo(() => Subscription, 'subscriptionId')
  subscription: Subscription;

  @ForeignKey(() => Auth)
  @Column
  authId: number;

  @BelongsTo(() => Auth, 'authId')
  auth: Auth;
}

export default Contact;
