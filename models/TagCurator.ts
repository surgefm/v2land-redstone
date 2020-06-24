import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import Tag from './Tag';
import Client from './Client';

@Table({
  modelName: 'tagCurator',
  freezeTableName: true,
} as TableOptions)
class TagCurator extends Model<TagCurator> {
  @ForeignKey(() => Tag)
  @Column(DataType.INTEGER)
  tagId: number;

  @ForeignKey(() => Client)
  @Column(DataType.INTEGER)
  curatorId: number;
}

export default TagCurator;
