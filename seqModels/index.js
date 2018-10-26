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
const ReportNotification = require('./ReportNotification');
const Contact = require('./Contact');

Event.hasOne(HeaderImage, {
  as: 'headerImage',
  foreignKey: 'event',
});

Event.hasMany(Stack, {
  as: 'stacks',
  foreignKey: 'event',
  sourceKey: 'id',
});

Event.hasMany(News, {
  foreignKey: 'event',
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

Client.hasMany(Contact, {
  as: 'contacts',
  foreignKey: 'owner',
});

Client.hasMany(Report, {
  as: 'reports',
  foreignKey: 'owner',
});

Record.belongsTo(Client, {
  foreignKey: 'owner',
});

Auth.belongsTo(Client, {
  foreignKey: 'owner',
});

Subscription.belongsTo(Client, {
  foreignKey: 'subscriber',
});

Subscription.hasOne(Contact);

Notification.belongsToMany(Report, {
  through: ReportNotification,
  foreignKey: 'notificationId',
});

Report.belongsToMany(Notification, {
  through: ReportNotification,
  foreignKey: 'reportId',
});

Contact.hasOne(Auth);

sequelize.sync();

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
  ReportNotification,
  Contact,
};
