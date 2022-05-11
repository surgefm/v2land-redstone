import { RedstoneRequest, RedstoneResponse } from '@Types';
import { TagService } from '@Services';

async function addCurator(req: RedstoneRequest, res: RedstoneResponse) {
  const tagId = +req.params.tagId;
  const curatorId = req.body.curatorId;
  if (!curatorId) {
    return res.status(400).json({
      message: '缺失参数: curatorId',
    });
  }
  const tagCurator = await TagService.addCurator(tagId, curatorId, req.currentClient);
  if (tagCurator) {
    res.status(201).json({
      message: '成功添加话题主持人',
      tagId,
      curatorId,
    });
  } else {
    res.status(200).json({
      message: '该用户本来就是该话题主持人',
    });
  }
}

export default addCurator;
