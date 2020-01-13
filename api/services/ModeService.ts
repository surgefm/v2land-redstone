import { Report } from '@Models';
import * as modeCollection from '@Modes';
import { NotificationMode } from '@Types';

const names: Record<string, NotificationMode> = {};

for (const key of Object.keys(modeCollection)) {
  const mode: NotificationMode = (modeCollection as any)[key];
  names[mode.name] = mode;
}

function getRecordActionName(report: Report) {
  const method = report.method.slice(0, 1).toUpperCase() + report.method.slice(1);
  const type = report.type.slice(0, 1).toUpperCase() + report.type.slice(1);
  return `send${method}${type}Report`;
}

function getMode(mode: string) {
  if ((modeCollection as any)[mode]) return (modeCollection as any)[mode];
  return names[mode] || null;
}

export {
  names,
  getRecordActionName,
  getMode,
  modeCollection,
};
