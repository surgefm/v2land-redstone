import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Default,
  Is,
  HasOne,
  HasMany,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
} from 'sequelize-typescript';
import _ from 'lodash';

import HeaderImage from './HeaderImage';
import Stack from './Stack';
import News from './News';
import Critique from './Critique';
import Notification from './Notification';
import Subscription from './Subscription';
import EventStackNews from './EventStackNews';
import EventTag from './EventTag';
import Tag from './Tag';
import Record from './Record';
import Client from './Client';
import EventContributor from './EventContributor';
import Star from './Star';

@Table({
  modelName: 'event',
  freezeTableName: true,
} as TableOptions)
class Event extends Model<Event> {
  @AllowNull(false)
  @Is('EventName', (value) => {
    if (!_.isString(value) || value.length === 0) {
      throw new Error('时间线名不得为空');
    } else if (value.trim() !== value) {
      throw new Error('时间线名两端不应含有空格');
    }

    let allDigit = true;
    for (const char of value) {
      if (!/\d/.test(char)) {
        allDigit = false;
        break;
      }
    }
    if (allDigit) {
      throw new Error('时间线名不得全为数字');
    }

    const reserved = [
      'register', 'new', 'setting', 'admin', 'dashboard', 'trending',
      'about', 'subscription', 'index', 'login', 'verify', 'list',
      'pending', 'post', 'topic', 'event', 'home', 'logout', 'signup',
    ];

    if (reserved.includes(value)) {
      throw new Error(`时间线名不得为以下文字：${reserved.join(', ')}`);
    }
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

  @Default(false)
  @Column(DataType.BOOLEAN)
  needContributor: boolean;

  @HasOne(() => HeaderImage, 'eventId')
  headerImage: HeaderImage;

  @HasMany(() => Stack, 'eventId')
  stacks: Stack[];

  @HasMany(() => Critique, 'eventId')
  critiques: Critique[];

  @HasMany(() => Notification, 'eventId')
  notifications: Notification[];

  @HasMany(() => Subscription, 'eventId')
  subscriptions: Subscription[];

  @HasMany(() => Star, 'eventId')
  stars: Star[];

  @ForeignKey(() => News)
  @Column
  latestAdmittedNewsId: number;

  @BelongsTo(() => News, 'latestAdmittedNewsId')
  latestAdmittedNews: News;

  @ForeignKey(() => Client)
  @Column
  ownerId: number;

  @BelongsTo(() => Client, 'ownerId')
  owner: Client;

  @ForeignKey(() => Event)
  @Column
  parentId: number;

  @BelongsTo(() => Event, 'parentId')
  parent: Event;

  @BelongsToMany(() => Tag, () => EventTag)
  tags: (Tag & {EventTag: EventTag})[] | Tag[];

  @BelongsToMany(() => News, () => EventStackNews)
  news: (News & {EventStackNews: EventStackNews})[];

  @BelongsToMany(() => News, () => EventStackNews)
  offshelfNews: (News & {EventStackNews: EventStackNews})[];

  stackCount?: number;
  newsCount?: number;
  starCount?: number;
  commitTime?: Date;
  contribution?: Record[];
  roles?: {
    owners: number[];
    managers: number[];
    editors: number[];
    viewers: number[];
  };
  contributors?: EventContributor[];
  contributorIdList?: number[];
  time?: Date;
}

export default Event;
