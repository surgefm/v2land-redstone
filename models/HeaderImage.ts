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
import Event from './Event';

@Table({
  modelName: 'headerImage',
  freezeTableName: true,
} as TableOptions)
class HeaderImage extends Model<HeaderImage> {
  @AllowNull(false)
  @Column(DataType.TEXT)
  imageUrl: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  source: string;

  @IsUrl
  @AllowNull(true)
  @Column(DataType.TEXT)
  sourceUrl?: string;

  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @BelongsTo(() => Event, 'eventId')
  @Column
  event: Event;
}

export default HeaderImage;
