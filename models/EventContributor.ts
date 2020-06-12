import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import Event from './Event';
import Client from './Client';

@Table({
  modelName: 'eventContributor',
  freezeTableName: true,
} as TableOptions)
class EventContributor extends Model<EventContributor> {
  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @ForeignKey(() => Client)
  @Column
  contributorId: number;

  @Column(DataType.NUMBER)
  points: number;
}

export default EventContributor;
