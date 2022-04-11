/**
 * @types/connect-session-sequelize
 * From https://github.com/calebsander/connect-session-sequelize-types/blob/master/index.d.ts
 */
declare module 'connect-session-sequelize' {
  import { Store } from 'express-session';
  import * as Sequelize from 'sequelize';
  import * as session from 'express-session';

  interface DefaultFields {
    data: string;
    expires: Date;
  }

  interface Data {
    [column: string]: any;
  }

  interface SequelizeStoreOptions {
    db: Sequelize.Sequelize;
    table?: Sequelize.Model<any, any>;
    extendDefaultFields?: (defaults: DefaultFields, session: any) => Data;
    checkExpirationInterval?: number;
    expiration?: number;
  }

  class SequelizeStore extends Store {
    sync(): void
    touch: (sid: string, data: any, callback?: (err: any) => void) => void
    get(sid: string, callback: (err: any, session?: session.SessionData | null) => void): void;
    set(sid: string, session: session.SessionData, callback?: (err?: any) => void): void;
    destroy(sid: string, callback?: (err?: any) => void): void;
  }

  interface SequelizeStoreConstructor {
    new(options: SequelizeStoreOptions): SequelizeStore;
  }

  export default function init(store: typeof Store): SequelizeStoreConstructor;
}
