module.exports = {
  needNews: true,
  new: async () => {
    return new Date('1/1/3000');
  },
  update: async () => {
    return new Date('1/1/2000');
  },
  notified: async () => {
    return new Date('1/1/3000');
  },
  getTemplate: async ({ notification, event, news }) => {
    return {
      subject: `${event.name} 有了新的消息`,
      message: `${news.source} 发布了关于 ${event.name} 的新消息：「${news.abstract}」`,
      button: '点击按钮查看新闻',
      url: `${sails.config.globals.site}/${event.id}?news=${news.id}`,
    };
  },
};
