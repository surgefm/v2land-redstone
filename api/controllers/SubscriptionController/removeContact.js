const SeqModels = require('../../../seqModels');

async function removeContact (req, res) {
  if (!(req.query && req.query.id && req.query.unsubscribeId)) {
    return res.status(400).json({
      message: '缺少 id 或 unsubscribeId 参数',
    });
  }

  const contact = await SeqModels.Contact.findOne({
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
    await SeqModels.Contact.upsert({
      where: {
        id: contact.id,
        status: 'inactive',
      },
    }, { transaction });

    await RecordService.update({
      model: 'Contact',
      action: 'removeSubscriptionContact',
      owner: req.session.clientId,
      data: { status: 'inactive' },
      before: subscription,
    }, { transaction });
  });

  res.status(201).json({
    name: 'Remove successfully',
    message: '成功取消关注。',
  });
}

module.exports = removeContact;
