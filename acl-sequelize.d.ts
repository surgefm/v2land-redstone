import Acl from 'acl';
import { Sequelize } from 'sequelize';

type Options = {
  prefix?: string;
} | undefined;

declare type AclSeq = Acl.Backend<Sequelize>
interface AclSeqStatic {
  new (db: Sequelize, options: Options): AclSeq;
}

declare const AclSeqStatic: AclSeqStatic;

export = AclSeqStatic;
