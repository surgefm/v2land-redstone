const pinyin = require('pinyin');

module.exports = {

  findEvent: async (eventName) => {
    const event = await Event.findOne({
      or: [
        { id: parseInt(eventName) > -1 ? parseInt(eventName) : -1 },
        { name: eventName },
      ],
    })
      .populate('news', {
        where: { status: 'admitted' },
        sort: 'time DESC',
        limit: 15,
      })
      .populate('headerImage');

    if (event) {
      event.newsCount = await News.count({
        where: {
          event: event.id,
          status: 'admitted',
        },
      });
    }

    return event;
  },

  generatePinyin: (name) => {
    const array = pinyin(name, {
      segment: false,
      style: 0,
    });

    const characters = [];
    for (let i = 0; i < 9; i++) {
      if (!array[i]) break;
      if (/^[a-z]*$/.test(array[i])) {
        characters.push(array[i]);
      }
    }

    return characters.length > 1
      ? characters.join('-')
      : null;
  },

};
