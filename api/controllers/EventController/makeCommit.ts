import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService, CommitService } from '@Services';

async function makeCommit(req: RedstoneRequest, res: RedstoneResponse) {
  const eventId = await EventService.getEventId(req.params.eventName);
  if (!eventId) {
    return res.status(404).json({
      message: '未能找到该事件',
    });
  }
  const { clientId } = req.session;
  const summary = req.query.summary || req.body.summary;
  const commit = await CommitService.makeCommit(eventId, clientId, summary);

  if (commit) {
    res.status(201).json(commit);
  } else {
    res.status(200).json({
      message: '事件信息较上次保存没有变化',
    });
  }
}

export default makeCommit;
