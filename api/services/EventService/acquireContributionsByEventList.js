async function acquireContributionsByEventList (eventList) {
  const queue = [];

  const getCon = async (event) => {
    event.contribution = await EventService.getContribution(event);
  };

  if (eventList) {
    for (const event of eventList) {
      queue.push(getCon(event));
    }
  }

  await Promise.all(queue);
  return eventList;
}

module.exports = acquireContributionsByEventList;
