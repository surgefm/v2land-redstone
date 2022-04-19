import { Event, News, Stack, Client, Tag, Site } from '@Models';
import { updateAlgoliaIndex as updateEventAlgoliaIndex } from '../EventService';
import { updateAlgoliaIndex as updateNewsAlgoliaIndex } from '../NewsService';
import { updateAlgoliaIndex as updateTagAlgoliaIndex } from '../TagService';
import { updateAlgoliaIndex as updateClientAlgoliaIndex } from '../ClientService';
import { updateAlgoliaIndex as updateStackAlgoliaIndex } from '../StackService';
import { updateSite } from './index';

export const initializeAlgolia = async () => {
  try {
    const events = await Event.findAll();
    for (const event of events) {
      await updateEventAlgoliaIndex({ event });
    }

    const news = await News.findAll();
    for (const n of news) {
      await updateNewsAlgoliaIndex({ news: n });
    }

    const stacks = await Stack.findAll();
    for (const stack of stacks) {
      await updateStackAlgoliaIndex({ stack });
    }

    const clients = await Client.findAll();
    for (const client of clients) {
      await updateClientAlgoliaIndex({ client });
    }

    const tags = await Tag.findAll();
    for (const tag of tags) {
      await updateTagAlgoliaIndex({ tag });
    }

    const sites = await Site.findAll();
    await updateSite(sites);
  } catch (err) {
    console.log(err);
  }
};
