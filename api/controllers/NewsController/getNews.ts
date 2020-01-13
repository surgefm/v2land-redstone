import { News, Stack, Client } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { NewsService } from '@Services';

async function getNews (req: RedstoneRequest, res: RedstoneResponse) {
  let id;
  if (req.body && req.body.news) {
    id = req.body.news;
  } else if (req.query && req.query.news) {
    id = req.query.news;
  } else if (req.param('news')) {
    id = req.param('news');
  }

  if (!id) {
    return res.status(400).json({
      message: '缺少参数：news。',
    });
  }

  let news = await News.findOne({
    where: { id },
    include: [{
      model: Stack,
      as: 'stack',
    }],
  });
  if (!news) {
    return res.status(404).json({ message: '未找到该新闻' });
  }
  let newsObj: any = news.get({ plain: true });

  if (news.status !== 'admitted') {
    if (req.session.clientId) {
      const client = await Client.findByPk(req.session.clientId);
      if (!client || !['manager', 'admin'].includes(client.role)) {
        return res.status(404).json({ message: '该新闻尚未通过审核' });
      }
    } else {
      return res.status(404).json({ message: '该新闻尚未通过审核' });
    }
  }

  newsObj.contribution = await NewsService.getContribution(news, true);
  res.status(200).json({ news: newsObj });
}

export default getNews;
