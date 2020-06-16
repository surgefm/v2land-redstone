import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  IsUrl,
  HasMany,
} from 'sequelize-typescript';
import SiteAccount from './SiteAccount';
import News from './News';

@Table({
  modelName: 'site',
  freezeTableName: true,
} as TableOptions)
class Site extends Model<Site> {
  @Column(DataType.TEXT)
  name: string;

  @AllowNull
  @Column(DataType.TEXT)
  description: string;

  @AllowNull
  @Column(DataType.TEXT)
  icon: string;

  @IsUrl
  @AllowNull
  @Column(DataType.TEXT)
  homepage: string;

  @HasMany(() => SiteAccount, 'siteId')
  accounts: SiteAccount[];

  @HasMany(() => News, 'siteId')
  news: News[];
}

export default Site;
