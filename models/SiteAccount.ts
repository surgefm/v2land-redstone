import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  IsUrl,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import Site from './Site';

@Table({
  modelName: 'siteAccount',
  freezeTableName: true,
} as TableOptions)
class SiteAccount extends Model<SiteAccount> {
  @Column(DataType.TEXT)
  username: string;

  @IsUrl
  @AllowNull
  @Column(DataType.TEXT)
  homepage: string;

  @AllowNull
  @Column(DataType.TEXT)
  avatar: string;

  @ForeignKey(() => Site)
  @Column(DataType.INTEGER)
  siteId: number;

  @BelongsTo(() => Site, 'siteId')
  site: Site;
}

export default SiteAccount;
