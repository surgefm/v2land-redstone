import { RedstoneRequest, RedstoneResponse } from '@Types';
import { TagService } from '@Services';

async function addCuration(req: RedstoneRequest, res: RedstoneResponse) {
  const tagId = +req.params.tagId;
  const curatorId = req.session.clientId;
  const eventId = +req.params.eventId;
  const { state, comment } = req.body;
  if (!eventId) {
    return res.status(400).json({
      message: '缺失参数: eventId',
    });
  }

  if (!['certified', 'need improvement', 'warning'].includes(state)) {
    return res.status(400).json({
      message: '参数 state 必须为 "certified", "need improvement" 或 "warning"',
    });
  }

  const curation = await TagService.addCuration(tagId, curatorId, eventId, state, comment);
  if (curation) {
    res.status(201).json({
      message: '成功添加点评',
      curation,
    });
  } else {
    res.status(200).json({
      message: '添加失败',
    });
  }
}

export default addCuration;
