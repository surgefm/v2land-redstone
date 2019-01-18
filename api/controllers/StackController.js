/**
 * StackController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const StackController = {

  getStack: require('./StackController/getStack'),

  getStackList: require('./StackController/getStackList'),

  updateStack: require('./StackController/updateStack'),

  updateMultipleStacks: require('./StackController/updateMultipleStacks'),

};

module.exports = StackController;
