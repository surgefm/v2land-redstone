const Auth = require('./Auth.js`');
const Client = require('./Client.js');
const Critique = require('./Critique.js');
const Event = require('./Event.js');
const HeaderImage = require('./HeaderImage.js');
const News = require('./News.js');
const Notification = require('./Notification.js');
const Record = require('./Record.js');
const Stack = require('./Stack.js');
const Subscription = require('./Subscription.js');

Event.hasOne(HeaderImage, {
  as: 'headerImage',
  foreignKey: 'headerImage',
});

Event.hasMany(Stack, {
  foreignKey: 'event',
  sourceKey: 'id',
});

Stack.hasMany(News, {
  foreignKey: 'stack',
  sourceKey: 'id',
});

Critique.belongsTo(Event, {
  foreignKey: 'event',
  targetKey: 'id',
});

Client.hasMany(Auth, {
  foreignKey: 'owner',
  targetKey: 'id',
});

module.exports = {
  Auth,
  Client,
  Critique,
  Event,
  HeaderImage,
  News,
  Notification,
  Record,
  Stack,
  Subscription,
};
