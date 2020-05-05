declare module 'acl-sequelize' {
  import Acl from 'acl';
  import { Sequelize } from 'sequelize';

  type Options = {
    prefix?: string;
    defaultSchema?: any;
    schema?: any;
  } | undefined;

  type AclSeq = Acl.Backend<Sequelize>
  interface AclSeqStatic {
    new (db: Sequelize, options: Options): AclSeq;
  }

  const AclSeqStatic: AclSeqStatic;

  export = AclSeqStatic;
}
