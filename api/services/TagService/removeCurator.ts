import { Tag, TagCurator, Client, sequelize } from '@Models';
import { RedstoneError, ResourceNotFoundErrorType } from '@Types';
import * as AccessControlService from '@Services/AccessControlService';
import * as RecordService from '@Services/RecordService';

async function removeCurator(tagId: number, curatorId: number, by?: number | Client) {
  const existingTagCurator = await TagCurator.findOne({
    where: { tagId, curatorId },
  });
  if (!existingTagCurator) return null;

  const tag = await Tag.findByPk(tagId);
  if (!tag) {
    throw new RedstoneError(ResourceNotFoundErrorType, `未找到该话题：${tagId}`);
  }

  const client = await Client.findByPk(curatorId);
  if (!client) {
    throw new RedstoneError(ResourceNotFoundErrorType, `未找到该用户：${curatorId}`);
  }

  const byClient = typeof by === 'number' ? await Client.findByPk(by) : by;
  if (by && !byClient) {
    throw new RedstoneError(ResourceNotFoundErrorType, `未找到该用户：${by}`);
  }

  await sequelize.transaction(async transaction => {
    await RecordService.create({
      model: 'TagCurator',
      action: 'removeTagCurator',
      data: existingTagCurator,
      target: tag.id,
      subtarget: curatorId,
      client: byClient.id,
    }, { transaction });
    await existingTagCurator.destroy({ transaction });
    await AccessControlService.disallowClientToManageTag(curatorId, tagId);
  });
  return existingTagCurator;
}

export default removeCurator;
