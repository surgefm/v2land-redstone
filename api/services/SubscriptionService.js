module.exports = {

  generateUnsubscribeId: () => {
    return Math.floor(Math.random() * 100000000) + Date.now();
  },

};
