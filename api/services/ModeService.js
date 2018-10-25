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

module.exports = {
  names,
  ...modeCollection,
};
