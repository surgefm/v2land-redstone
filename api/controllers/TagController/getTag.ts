import { Tag, Event, EventTag, News, Client, Sequelize, TagCuration } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { ClientService, TagService, EventService } from '@Services';

async function getTag(req: RedstoneRequest, res: RedstoneResponse) {
  const tag = await Tag.findByPk(req.params.tagId, {
    include: [{
      model: Client,
      as: 'curators',
      through: { attributes: [] },
      required: false,
      attributes: ClientService.sanitizedFields,
    }],
  });

  let tagVisible = !tag || tag.status !== 'hidden';
  if (!tagVisible && req.currentClient) {
    if (req.currentClient.isEditor) {
      tagVisible = true;
    }
  }

  if (!tag || !tagVisible) {
    return res.status(404).json({
      message: '无法找到该标签',
    });
  }

  const allChildTags = await TagService.getAllChildTags({ tag });
  const ids = [tag.id, ...allChildTags.map(t => t.id)];

  const tagObj = tag.get({ plain: true }) as any;

  const eventTags = await EventTag.findAll({
    where: {
      tagId: {
        [Sequelize.Op.in]: ids,
      },
    },
  });

  const eventIds = Array.from(new Set(eventTags.map(t => t.eventId)));

  const events = await Promise.all(eventIds.map(async id => {
    const event = await Event.findOne({
      where: {
        id,
        status: 'admitted',
      },
      include: [{
        model: News,
        as: 'latestAdmittedNews',
        required: false,
      }],
    });
    if (!event) return;
    const eventObj = event.get({ plain: true }) as any;
    eventObj.curations = await EventService.getCurations(event.id);
    return eventObj;
  }));

  tagObj.events = events.filter(e => e).sort((a, b) => {
    const isACertified = a.curations.find((c: TagCuration) => c.state === 'certified');
    const isBCertified = b.curations.find((c: TagCuration) => c.state === 'certified');
    const isAWarned = a.curations.find((c: TagCuration) => c.state === 'warning');
    const isBWarned = b.curations.find((c: TagCuration) => c.state === 'warning');
    if (isAWarned && !isBWarned) return 1;
    if (!isAWarned && isBWarned) return -1;
    if (isACertified && !isBCertified) return -1;
    if (!isACertified && isBCertified) return 1;
    return a.updatedAt > b.updatedAt ? -1 : 1;
  });

  tagObj.parents = await Promise.all(
    (tag.hierarchyPath || [])
      .filter(t => t !== tag.id)
      .map(t => Tag.findByPk(t))
  );
  tagObj.children = await Tag.findAll({
    where: {
      parentId: tag.id,
    },
  });
  return res.status(200).json({ tag: tagObj });
}

export default getTag;
