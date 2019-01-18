async function getEvent (req, res) {
  const name = req.param('eventName');
  const event = await EventService.findEvent(name, {
    includes: req.query,
  });

  if (event) {
    event.contribution = await EventService.getContribution(event, true);
    res.status(200).json(event);
  } else {
    res.status(404).json({
      message: '未找到该事件',
    });
  }
}

module.exports = getEvent;
