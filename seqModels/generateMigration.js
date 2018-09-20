require('../config/globals');
const models = require('.');

module.exports = function(modelName) {
  const cap = modelName[0].toUpperCase() + modelName.substr(1);
  const low = modelName[0].toLowerCase() + modelName.substr(1);
  const model = models[cap];

  return {
    up: (queryInterface, Sequelize) => {
      return queryInterface.createTable(low, model.attributes);
      /*
        Add altering commands here.
        Return a promise to correctly handle asynchronicity.

        Example:
        return queryInterface.createTable('users', { id: Sequelize.INTEGER });
      */
    },

    down: (queryInterface, Sequelize) => {
      /*
        Add reverting commands here.
        Return a promise to correctly handle asynchronicity.

        Example:
        return queryInterface.dropTable('users');
      */
    },
  };
};
