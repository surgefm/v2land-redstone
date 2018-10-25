const modeCollection = {

  'EveryNewStack': require('../modes/EveryNewStack'),

  '30DaysSinceLatestStack': require('../modes/30DaysSinceLatestStack'),

  // Every time a latest news is admitted.
  'new': require('../modes/new'),

  '7DaysSinceLatestNews': require('../modes/7DaysSinceLatestNews'),

  'daily': require('../modes/daily'),

  'weekly': require('../modes/weekly'),

  'monthly': require('../modes/monthly'),

  'EveryFriday': require('../modes/EveryFriday'),

};

const names = {};
Object.keys(modeCollection).map(key => names[key] = modeCollection[key].name);

function getRecordActionName(report) {
  const method = report.method.slice(0, 1).toUpperCase() + report.method.slice(1);
  const type = report.type.slice(0, 1).toUpperCase() + report.type.slice(1);
  return `Send${method}${type}Report`;
}

module.exports = {
  names,
  getRecordActionName,
  ...modeCollection,
};
