import {
  Table,
  Column,
  Model,
  TableOptions,
  ForeignKey,
} from 'sequelize-typescript';
import Stack from './Stack';
import News from './News';

@Table({
  modelName: 'stackNews',
  freezeTableName: true,
} as TableOptions)
class StackNews extends Model<StackNews> {
  @ForeignKey(() => Stack)
  @Column
  stackId: number;

  @ForeignKey(() => News)
  @Column
  newsId: number;
}

export default StackNews;
