import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Default,
  IsUrl,
  Length,
  BelongsToMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';

import Stack from './Stack';
import Record from './Record';
import EventStackNews from './EventStackNews';
import Event from './Event';
import Site from './Site';
import SiteAccount from './SiteAccount';

@Table({
  modelName: 'news',
  freezeTableName: true,
} as TableOptions)
class News extends Model<News> {
  @IsUrl
  @AllowNull(false)
  @Column(DataType.TEXT)
  url: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  source: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  title: string;

  @Length({ min: 0, max: 203 })
  @AllowNull(true)
  @Column(DataType.TEXT)
  abstract: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  time: Date;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'admitted', 'rejected', 'removed'))
  status: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  comment?: string;

  @BelongsToMany(() => Stack, () => EventStackNews)
  stacks: (Stack & {EventStackNews: EventStackNews})[];

  @BelongsToMany(() => Event, () => EventStackNews)
  events: (Event & {EventStackNews: EventStackNews})[];

  @ForeignKey(() => Site)
  @Column(DataType.INTEGER)
  siteId: number;

  @BelongsTo(() => Site, 'siteId')
  site: Site;

  @ForeignKey(() => SiteAccount)
  @Column(DataType.INTEGER)
  siteAccountId: number;

  @BelongsTo(() => SiteAccount, 'siteAccountId')
  siteAccount: SiteAccount;

  contribution?: Record[];
}

export default News;
