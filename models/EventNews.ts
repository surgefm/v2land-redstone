import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
} from 'sequelize-typescript';
import Event from './Event';
import News from './News';

@Table({
  modelName: 'eventNews',
  freezeTableName: true,
} as TableOptions)
class EventNews extends Model<EventNews> {
  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @ForeignKey(() => News)
  @Column
  newsId: number;
}

export default EventNews;
