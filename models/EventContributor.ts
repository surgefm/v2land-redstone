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
import Commit from './Commit';

@Table({
  modelName: 'eventContributor',
  freezeTableName: true,
} as TableOptions)
class EventContributor extends Model<EventContributor> {
  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @ForeignKey(() => Commit)
  @Column
  commitId: number;

  @ForeignKey(() => Client)
  @Column
  contributorId: number;

  @ForeignKey(() => EventContributor)
  @Column
  parentId: number;

  @Column(DataType.FLOAT)
  points: number;
}

export default EventContributor;
