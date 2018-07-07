const modeCollection = {

  'newStack': require('../modes/newStack'),

  // Every time a latest news is admitted.
  'new': require('../modes/new'),

  '7DaysSinceLatestNews': require('../modes/7DaysSinceLatestNews'),

  'daily': require('../modes/daily'),

  'weekly': require('../modes/weekly'),

  'monthly': require('../modes/monthly'),

};

module.exports = modeCollection;
