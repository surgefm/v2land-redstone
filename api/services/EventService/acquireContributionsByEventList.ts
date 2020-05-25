import getContribution from './getContribution';
import { SimplifiedEventInterface } from '@Types';

async function acquireContributionsByEventList(eventList: SimplifiedEventInterface[]) {
  const queue = [];

  const getCon = async (event: SimplifiedEventInterface) => {
    event.contribution = await getContribution(event);
  };

  if (eventList) {
    for (const event of eventList) {
      queue.push(getCon(event));
    }
  }

  await Promise.all(queue);
  return eventList;
}

export default acquireContributionsByEventList;
