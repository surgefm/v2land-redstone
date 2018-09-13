const Auth = require('./Auth');
const Client = require('./Client');
const Critique = require('./Critique');
const Event = require('./Event');
const HeaderImage = require('./HeaderImage');
const News = require('./News');
const Notification = require('./Notification');
const Record = require('./Record');
const Stack = require('./Stack');
const Subscription = require('./Subscription');
const NotificationItem = require('./NotificationItem');

Event.hasOne(HeaderImage, {
  as: 'headerImage',
  foreignKey: 'event',
});

Event.hasMany(Stack, {
  as: 'stacks',
  foreignKey: 'event',
  sourceKey: 'id',
});

Event.hasMany(Critique, {
  foreignKey: 'event',
});

Stack.hasMany(News, {
  as: 'news',
  foreignKey: 'stack',
  sourceKey: 'id',
});

Client.hasMany(Auth, {
  as: 'auths',
  foreignKey: 'owner',
  targetKey: 'id',
});

Auth.belongsTo(Client, {
  foreignKey: 'owner',
});

Client.hasMany(Subscription, {
  as: 'subscriptions',
  foreignKey: 'subscriber',
  targetKey: 'id',
});

Subscription.belongsTo(Client, {
  foreignKey: 'subscriber',
});

Client.hasMany(Record, {
  as: 'records',
  foreignKey: 'client',
});

Event.hasMany(NotificationItem, {
  as: 'NotificationItems',
  foreignKey: 'event',
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
  NotificationItem,
};
