import { Record } from '@Models';
import { CreateOptions } from 'sequelize/types';

interface RecordData {
  model: string;
  action: string;
  target: number;
  owner?: number;
  client?: number;
  data?: any;
  before?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const refineData = (data: RecordData) => {
  let model = data.model;
  model = model[0].toUpperCase() + model.slice(1);
  data.model = (model === 'Headerimage') ? 'HeaderImage' : model;
  data.createdAt = data.createdAt || new Date();
  data.updatedAt = data.updatedAt || new Date();
  if (data.client) {
    data.owner = data.client;
    delete data.client;
  }
  return data;
};

/**
 * model, action, target, owner, data, before
 */
export async function create (data: RecordData, options: CreateOptions) {
  return Record.create({
    ...refineData(data),
    operation: 'create',
  }, options);
}

export async function update (data: RecordData, options: CreateOptions) {
  return Record.create({
    ...refineData(data),
    operation: 'update',
  }, options);
}

export async function destroy (data: RecordData, options: CreateOptions) {
  return Record.create({
    ...refineData(data),
    operation: 'destroy',
  }, options);
}
