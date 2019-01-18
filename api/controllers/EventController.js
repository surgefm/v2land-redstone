/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const EventController = {

  getEvent: require('./EventController/getEvent'),

  getAllPendingEvents: require('./EventController/getAllPendingEvents'),

  getPendingNews: require('./EventController/getPendingNews'),

  createEvent: require('./EventController/createEvent'),

  updateEvent: require('./EventController/updateEvent'),

  getEventList: require('./EventController/getEventList'),

  createStack: require('./EventController/createStack'),

  createNews: require('./EventController/createNews'),

  updateHeaderImage: require('./EventController/updateHeaderImage'),
};

module.exports = EventController;
