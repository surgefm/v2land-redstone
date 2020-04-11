import { sequelize } from '@Models';
import { Transaction } from 'sequelize';

async function execWithTransaction(
  fn: (transaction: Transaction) => Promise<void>,
  transaction?: Transaction,
) {
  if (transaction) {
    return fn(transaction);
  } else {
    await sequelize.transaction(fn);
  }
}

export default execWithTransaction;
