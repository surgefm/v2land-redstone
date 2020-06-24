import { RedstoneRequest, RedstoneResponse } from '@Types';
import { TagService } from '@Services';

async function removeCurator(req: RedstoneRequest, res: RedstoneResponse) {
  const tagId = +req.params.tagId;
  const curatorId = +req.params.curatorId;
  const tagCurator = await TagService.removeCurator(tagId, curatorId, req.currentClient);
  if (tagCurator) {
    res.status(201).json({
      message: '成功移除话题主持人',
      tagId,
      curatorId,
    });
  } else {
    res.status(200).json({
      message: '该用户本来就不是该话题主持人',
    });
  }
}

export default removeCurator;
