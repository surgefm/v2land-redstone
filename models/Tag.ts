import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Unique,
  BelongsToMany,
  Default,
} from 'sequelize-typescript';
import Event from './Event';
import EventTag from './EventTag';

@Table({
  modelName: 'tag',
  freezeTableName: true,
} as TableOptions)
class Tag extends Model<Tag> {
  @Unique
  @Column(DataType.TEXT)
  name: string;

  @AllowNull
  @Column(DataType.TEXT)
  description: string;

  @Default('visible')
  @Column(DataType.ENUM('visible', 'hidden'))
  status: string;

  @BelongsToMany(() => Event, () => EventTag)
  events: Array<Event & {EventTag: EventTag}>;
}

export default Tag;
