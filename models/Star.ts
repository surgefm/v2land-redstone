import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  DataType,
  IsUUID,
} from 'sequelize-typescript';

import Event from './Event';
import Client from './Client';

@Table({
  modelName: 'star',
  freezeTableName: true,
} as TableOptions)
class Star extends Model<Star> {
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.TEXT)
  id: string;

  @BelongsTo(() => Client)
  client: Client;

  @ForeignKey(() => Client)
  @Column
  clientId: number;

  @BelongsTo(() => Event)
  event: Event;

  @ForeignKey(() => Event)
  @Column
  eventId: number;
}

export default Star;
