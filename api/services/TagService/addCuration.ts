import uuidv4 from 'uuid/v4';
import { Tag, EventTag, TagCurator, TagCuration, sequelize } from '@Models';
import * as AccessControlService from '@Services/AccessControlService';
import * as RecordService from '@Services/RecordService';
import { getLatestCommit } from '@Services/CommitService';

async function addCuration(tagId: number, curatorId: number, eventId: number, state: string, comment = '') {
  const hasAccess = await AccessControlService.isAllowedToManageTag(curatorId, tagId);
  if (!hasAccess) {
    const tagCurator = await TagCurator.findOne({
      where: { tagId, curatorId },
    });
    if (!tagCurator) return;
  }

  const eventTags = await EventTag.findAll({ where: { eventId } });
  let found = false;
  for (const eventTag of eventTags) {
    const tag = await Tag.findByPk(eventTag.tagId);
    if (tag.hierarchyPath.includes(tagId)) {
      found = true;
      break;
    }
  }
  if (!found) return;

  const latestCommit = await getLatestCommit(eventId);
  const commitId = latestCommit ? latestCommit.id : undefined;

  const curation = await sequelize.transaction(async transaction => {
    const existingCuration = await TagCuration.findOne({
      where: { tagId, eventId, commitId },
      transaction,
    });
    if (existingCuration) {
      if (existingCuration.state === state && existingCuration.comment === comment) return;
      const before = {
        state: existingCuration.state,
        comment: existingCuration.comment,
        curatorId: existingCuration.curatorId,
      };
      existingCuration.state = state;
      existingCuration.comment = comment;
      existingCuration.curatorId = curatorId;
      await existingCuration.save({ transaction });
      await RecordService.update({
        model: 'tagCuration',
        action: 'updateTagCuration',
        data: { state, comment },
        targetUUID: existingCuration.id,
        subtarget: eventId,
        owner: curatorId,
        before,
      }, { transaction });
      return existingCuration;
    }
    const data = { id: uuidv4(), tagId, eventId, curatorId, state, comment, commitId };
    const curation = await TagCuration.create(data, { transaction });
    await RecordService.create({
      model: 'tagCuration',
      action: 'addTagCuration',
      data,
      targetUUID: curation.id,
      owner: curatorId,
    });
    return curation;
  });

  return curation;
}

export default addCuration;
