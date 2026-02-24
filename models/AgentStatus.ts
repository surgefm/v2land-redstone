import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
  BelongsTo,
  AllowNull,
  DataType,
  IsUUID,
  PrimaryKey,
} from 'sequelize-typescript';

import Client from './Client';
import Event from './Event';

@Table({
  modelName: 'agentStatus',
  freezeTableName: true,
} as TableOptions)
class AgentStatus extends Model<AgentStatus> {
  @IsUUID(4)
  @PrimaryKey
  @Column
  id: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  runId: string;

  @AllowNull(false)
  @ForeignKey(() => Event)
  @Column
  eventId: number;

  @BelongsTo(() => Event, 'eventId')
  event: Event;

  @AllowNull(false)
  @Column(DataType.ENUM('status', 'thinking'))
  type: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  status: string;

  @AllowNull(false)
  @ForeignKey(() => Client)
  @Column
  authorId: number;

  @BelongsTo(() => Client, 'authorId')
  author: Client;
}

export default AgentStatus;
