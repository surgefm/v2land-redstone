import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
} from 'sequelize-typescript';
import Event from './Event';
import Tag from './Tag';

@Table({
  modelName: 'eventTag',
  freezeTableName: true,
} as TableOptions)
class EventTag extends Model<EventTag> {
  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @ForeignKey(() => Tag)
  @Column
  tagId: number;
}

export default EventTag;
