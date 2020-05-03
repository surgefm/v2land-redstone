import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService } from '@Services';

async function addNews(req: RedstoneRequest, res: RedstoneResponse) {
  if (!req.body || !req.body.newsId) {
    return res.status(400).json({
      message: '缺少参数：newsId。',
    });
  }

  const id = req.params.eventName;
  const esn = await EventService.addNews(id, req.body.newsId, req.currentClient.id);

  if (!esn) {
    return res.status(200).json({
      message: '该新闻已在该进展中',
    });
  }

  return res.status(201).json({
    message: '成功将新闻添加至进展中',
  });
}

export default addNews;
