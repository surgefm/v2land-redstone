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

Event.hasOne(HeaderImage, {
  as: 'headerImage',
  foreignKey: 'headerImage',
});

Event.hasMany(Stack, {
  foreignKey: 'event',
  sourceKey: 'id',
});

Event.hasMany(Critique, {
  foreignKey: 'event',
})

Stack.hasMany(News, {
  foreignKey: 'stack',
  sourceKey: 'id',
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
