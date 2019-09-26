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
const AuthorizationClient = require('./AuthorizationClient');
const AuthorizationCode = require('./AuthorizationCode');
const AuthorizationAccessToken = require('./AuthorizationAccessToken');

Event.hasOne(HeaderImage, {
  as: 'headerImage',
  foreignKey: 'eventId',
});

Event.hasMany(Stack, {
  as: 'stacks',
  foreignKey: 'eventId',
  sourceKey: 'id',
});

Event.hasMany(News, {
  foreignKey: 'eventId',
});

Event.hasMany(Critique, {
  foreignKey: 'eventId',
});

Event.hasMany(Notification, {
  foreignKey: 'eventId',
});

Event.hasMany(Subscription, {
  foreignKey: 'eventId',
});

Stack.hasMany(News, {
  as: 'news',
  foreignKey: 'stackId',
  sourceKey: 'id',
});

News.belongsTo(Stack, {
  foreignKey: 'stackId',
});

Event.belongsTo(News, {
  as: 'latestAdmittedNews',
  foreignKey: 'latestAdmittedNewsId',
});

Client.hasMany(Record, {
  as: 'records',
  foreignKey: 'owner',
  targetKey: 'id',
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

Client.hasMany(AuthorizationCode, {
  as: 'authorizationCodes',
  foreignKey: 'owner',
});

Client.hasMany(AuthorizationAccessToken, {
  as: 'authorizationAccessTokens',
  foreignKey: 'owner',
});

AuthorizationClient.hasMany(AuthorizationCode, {
  as: 'authorizationCodes',
  foreignKey: 'authorizationClientId',
});

AuthorizationClient.hasMany(AuthorizationAccessToken, {
  as: 'authorizationAccessTokens',
  foreignKey: 'authorizationClientId',
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

Subscription.hasMany(Contact, {
  foreignKey: 'subscriptionId',
});

Notification.belongsToMany(Report, {
  through: ReportNotification,
  foreignKey: 'notificationId',
});

Notification.belongsTo(Event, {
  foreignKey: 'eventId',
});

Report.belongsToMany(Notification, {
  through: ReportNotification,
  foreignKey: 'reportId',
});

Contact.belongsTo(Auth);

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
  AuthorizationClient,
  AuthorizationCode,
  AuthorizationAccessToken,
};
