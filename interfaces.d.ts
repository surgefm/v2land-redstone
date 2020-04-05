/* eslint-disable no-unused-vars */
import { Sequelize } from 'sequelize-typescript';

declare global {
  namespace NodeJS {
    interface Global {
      sequelize: Sequelize;
    }
  }
}
