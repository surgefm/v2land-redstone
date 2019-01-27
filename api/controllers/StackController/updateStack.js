async function updateStack (req, res) {
  const id = req.param('stackId');
  const data = req.body;

  try {
    await sequelize.transaction(async transaction => {
      const cb = await StackService.updateStack({
        id,
        data,
        clientId: req.session.clientId,
        transaction,
      });
      return res.status(cb.status).json(cb.message);
    });
  } catch (err) {
    if (err.message === '一个进展必须在含有一个已过审新闻的情况下方可开放') {
      return res.status(400).json({ message: err.message });
    }
    return res.serverError(err);
  }
}

module.exports = updateStack;
