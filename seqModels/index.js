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
const Report = require('./Report');

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

Event.hasMany(Notification, {
  foreignKey: 'event',
});

Event.hasMany(Subscription, {
  foreignKey: 'event',
});

Stack.hasMany(News, {
  as: 'news',
  foreignKey: 'stack',
  sourceKey: 'id',
});

Record.belongsTo(Client, {
  foreignKey: 'client',
  sourceKey: 'id',
});

Client.hasMany(Auth, {
  as: 'auths',
  foreignKey: 'owner',
  targetKey: 'id',
});

Client.hasMany(Subscription, {
  as: 'subscriptions',
  foreignKey: 'subscriber',
  targetKey: 'id',
});

Client.hasMany(Report, {
  as: 'reports',
  foreignKey: 'client',
});

Auth.belongsTo(Client, {
  foreignKey: 'owner',
});

Subscription.belongsTo(Client, {
  foreignKey: 'subscriber',
});

Notification.belongsToMany(Report, {
  through: 'ReportNotification',
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
  Report,
};
