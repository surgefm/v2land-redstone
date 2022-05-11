import {
  Table,
  Column,
  Model,
  DataType,
  TableOptions,
  AllowNull,
  Unique,
  BelongsTo,
  BelongsToMany,
  Default,
  ForeignKey,
} from 'sequelize-typescript';

import Client from './Client';
import Event from './Event';
import EventTag from './EventTag';
import TagCurator from './TagCurator';

@Table({
  modelName: 'tag',
  freezeTableName: true,
} as TableOptions)
class Tag extends Model<Tag> {
  @Unique
  @Column(DataType.TEXT)
  name: string;

  @AllowNull
  @Column(DataType.TEXT)
  slug: string;

  @AllowNull
  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.ARRAY(DataType.INTEGER))
  hierarchyPath: number[];

  @AllowNull
  @ForeignKey(() => Tag)
  @Column(DataType.INTEGER)
  redirectToId: number;

  @BelongsTo(() => Tag)
  redirectTo: Tag;

  @AllowNull
  @ForeignKey(() => Tag)
  @Column(DataType.INTEGER)
  parentId: number;

  @BelongsTo(() => Tag)
  parent: Tag;

  @Default('visible')
  @Column(DataType.ENUM('visible', 'hidden'))
  status: string;

  @BelongsToMany(() => Event, () => EventTag)
  events: Array<Event & {eventTag: EventTag}>;

  @BelongsToMany(() => Client, () => TagCurator)
  curators: Array<Client & {tagCurator: TagCurator}>;
}

export default Tag;
