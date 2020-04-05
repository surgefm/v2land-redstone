/**
 * @types/connect-session-sequelize
 * From https://github.com/calebsander/connect-session-sequelize-types/blob/master/index.d.ts
 */
import { Store } from 'express-session';
import * as Sequelize from 'sequelize';

declare interface DefaultFields {
	data: string
	expires: Date
}

declare interface Data {
	[column: string]: any
}

declare interface SequelizeStoreOptions {
	db: Sequelize.Sequelize
	table?: Sequelize.Model<any, any>
	extendDefaultFields?: (defaults: DefaultFields, session: any) => Data
	checkExpirationInterval?: number
	expiration?: number
}

declare class SequelizeStore extends Store {
	sync(): void
	touch: (sid: string, data: any, callback?: (err: any) => void) => void
}

declare interface SequelizeStoreConstructor {
	new(options: SequelizeStoreOptions): SequelizeStore
}

declare function init(store: typeof Store): SequelizeStoreConstructor
