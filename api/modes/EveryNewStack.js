module.exports = {
  needStack: true,
  new: async () => {
    return new Date('1/1/2000');
  },
  notified: async () => {
    return new Date('1/1/3000');
  },
  getTemplate: async ({ event, stack }) => {
    return {
      subject: `${event.name} 有了新的进展`,
      message: `${event.name} 最新进展：「${stack.title}」`,
      button: '点击按钮查看新闻',
      url: `${sails.config.globals.site}/${event.id}?stack=${stack.id}`,
    };
  },
};
