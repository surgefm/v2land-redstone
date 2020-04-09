import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
} from 'sequelize-typescript';
import Event from './Event';
import Stack from './Stack';
import News from './News';

@Table({
  modelName: 'eventStackNews',
  freezeTableName: true,
} as TableOptions)
class EventStackNews extends Model<EventStackNews> {
  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @ForeignKey(() => News)
  @Column
  newsId: number;

  @ForeignKey(() => Stack)
  @Column
  stackId: number;
}

export default EventStackNews;
