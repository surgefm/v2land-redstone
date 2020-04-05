import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Default,
  Unique,
  Is,
  HasOne,
  HasMany,
  ForeignKey,
} from 'sequelize-typescript';
import _ from 'lodash';

import HeaderImage from './HeaderImage';
import Stack from './Stack';
import News from './News';
import Critique from './Critique';
import Notification from './Notification';
import Subscription from './Subscription';

@Table({
  modelName: 'event',
  freezeTableName: true,
} as TableOptions)
class Event extends Model<Event> {
  @AllowNull(false)
  @Unique(true)
  @Is('EventName', (value) => {
    if (!_.isString(value) || value.length === 0) return false;
    if (value.trim() !== value) return false;

    let allDigit = true;
    for (const char of value) {
      if (!/\d/.test(char)) {
        allDigit = false;
        break;
      }
    }
    if (allDigit) return false;

    const reserved = ['register', 'new', 'setting', 'admin',
      'about', 'subscription', 'index', 'login', 'verify', 'list',
      'pending', 'post'];

    return !reserved.includes(value);
  })
  @Column(DataType.TEXT)
  name: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  pinyin?: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'admitted', 'rejected', 'hidden', 'removed'))
  status: string;

  @HasOne(() => HeaderImage, 'eventId')
  headerImage: HeaderImage;

  @HasMany(() => Stack, 'eventId')
  stacks: Stack[];

  @HasMany(() => News, 'eventId')
  news: News[];

  @HasMany(() => Critique, 'eventId')
  critiques: Critique[];

  @HasMany(() => Notification, 'eventId')
  notifications: Notification[];

  @HasMany(() => Subscription, 'eventId')
  subscriptions: Subscription[];

  @ForeignKey(() => News)
  @Column
  latestAdmittedNewsId: number;

  @HasOne(() => News, 'latestAdmittedNewsId')
  latestAdmittedNews: News;
}

export default Event;
