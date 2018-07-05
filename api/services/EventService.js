const pinyin = require('pinyin');

module.exports = {

  findEvent: async (eventName) => {
    let event = await Event.findOne({
      or: [
        { id: parseInt(eventName) > -1 ? parseInt(eventName) : -1 },
        { name: eventName },
      ],
    })
      .populate('stack', {
        where: {
          status: 'admitted',
          order: { '>': -1 },
        },
        sort: 'order DESC',
      })
      .populate('headerImage');

    if (event) {
      event = { ...event };
      event.newsCount = await News.count({
        where: {
          event: event.id,
          status: 'admitted',
        },
      });

      const queue = [];
      const getStackedNews = async (i) => {
        const stack = { ...event.stack[i] };
        stack.news = await News.find({
          where: {
            stack: stack.id,
            status: 'admitted',
          },
          sort: 'time ASC',
          limit: 3,
        });
        if (stack.news.length) {
          stack.time = stack.news[0].time;
        }
        stack.newsCount = await News.count({
          where: {
            stack: stack.id,
            status: 'admitted',
          },
        });
        event.stack[i] = stack;
      };
      for (let i = 0; i < event.stack.length; i++) {
        queue.push(getStackedNews(i));
      }
      await Promise.all(queue);
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
