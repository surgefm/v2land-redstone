module.exports = {

  findEvent: async (eventName) => {
    let event = await Event.findOne({
      or: [
        { id: parseInt(eventName) > -1 ? parseInt(eventName) : -1 },
        { name: eventName },
      ],
    })
      .populate('news', {
        where: { status: 'admitted' },
        sort: 'createdAt DESC',
      })
      .populate('headerImage');

    return event;
  },

};
