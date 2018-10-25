const { MissingParameterError } = require('../../../utils/errors');

async function notifyWhenEventStatusChanges(oldEvent, newEvent, client) {
  if (!oldEvent) {
    throw new MissingParameterError('oldEvent');
  }
  if (!newEvent) {
    throw new MissingParameterError('newEvent');
  }

  if ((oldEvent.status === 'pending' || oldEvent.status === 'rejected') &&
    newEvent.status === 'admitted') {
    return notifyWhenEventStatusChangesToAdmitted(newEvent, client);
  } else if (oldEvent.status === 'pending' && newEvent.status === 'rejected') {
    return notifyWhenEventStatusChangesToRejected(newEvent, client);
  } else if (oldEvent.status === 'hidden' && newEvent.status === 'admitted') {
    return notifyWhenEventStatusChangesToAdmittedFromHidden(newEvent, client);
  }
}

async function notifyWhenEventStatusChangesToAdmitted(newEvent, client) {
  return TelegramService.sendEventAdmitted(newEvent, client);
}

async function notifyWhenEventStatusChangesToRejected(newEvent, client) {
  return TelegramService.sendEventRejected(newEvent, client);
}

async function notifyWhenEventStatusChangesToAdmittedFromHidden(newEvent, client) {
  return;
}

module.exports = notifyWhenEventStatusChanges;
