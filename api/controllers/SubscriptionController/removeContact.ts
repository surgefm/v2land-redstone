import { RedstoneRequest, RedstoneResponse, sequelize } from '@Types';
import { Contact } from '@Models';
import { RecordService } from '@Services';

async function removeContact (req: RedstoneRequest, res: RedstoneResponse) {
  if (!(req.query && req.query.id && req.query.unsubscribeId)) {
    return res.status(400).json({
      message: '缺少 id 或 unsubscribeId 参数',
    });
  }

  const contact = await Contact.findOne({
    where: req.query,
  });

  if (!contact) {
    return res.status(404).json({
      message: '未找到该关注',
    });
  }

  if (contact.unsubscribeId !== req.query.unsubscribeId) {
    return res.status(400).json({
      message: '错误的解绑代码',
    });
  }

  await sequelize.transaction(async transaction => {
    await Contact.update({
      status: 'inactive',
    }, {
      where: { id: contact.id },
      transaction,
    });

    await RecordService.update({
      model: 'Contact',
      action: 'removeSubscriptionContact',
      owner: req.session.clientId,
      target: contact.owner,
      data: { status: 'inactive' },
      before: { status: contact.status },
    }, { transaction });
  });

  res.status(201).json({
    name: 'Remove successfully',
    message: '成功取消关注。',
  });
}

export default removeContact;
