import { Event, News, Stack, Client, Tag, Site } from '@Models';
import { updateEvent, updateNews, updateStack, updateClient, updateTag, updateSite } from './index';

export const initializeAlgolia = async () => {
  try {
    const events = await Event.findAll();
    await updateEvent(events);

    const news = await News.findAll();
    await updateNews(news);

    const stacks = await Stack.findAll();
    await updateStack(stacks);

    const clients = await Client.findAll();
    await updateClient(clients);

    const tags = await Tag.findAll();
    await updateTag(tags);

    const sites = await Site.findAll();
    await updateSite(sites);
  } catch (err) {
    console.log(err);
  }
};
