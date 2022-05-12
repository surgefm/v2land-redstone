import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
  DataType,
  IsUUID,
  PrimaryKey,
} from 'sequelize-typescript';
import Tag from './Tag';
import Client from './Client';
import Commit from './Commit';
import Event from './Event';

@Table({
  modelName: 'tagCuration',
  freezeTableName: true,
} as TableOptions)
class TagCuration extends Model<TagCuration> {
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUIDV4)
  id: string;

  @Column(DataType.TEXT)
  state: string;

  @Column(DataType.TEXT)
  comment?: string;

  @ForeignKey(() => Tag)
  @Column(DataType.INTEGER)
  tagId: number;

  @ForeignKey(() => Client)
  @Column(DataType.INTEGER)
  curatorId: number;

  @ForeignKey(() => Commit)
  @Column(DataType.INTEGER)
  commitId?: number;

  @ForeignKey(() => Event)
  @Column(DataType.INTEGER)
  eventId: number;
}

export default TagCuration;
