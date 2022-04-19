import algoliasearch, { SearchIndex } from 'algoliasearch';
import { News, Event, Stack, Site, Tag, Client } from '@Models';

export const client = algoliasearch(process.env.ALGOLIA_APPID, process.env.ALGOLIA_API_KEY);
export const newsIndex = client.initIndex('news');
export const eventIndex = client.initIndex('events');
export const clientIndex = client.initIndex('clients');
export const tagIndex = client.initIndex('tags');
export const siteIndex = client.initIndex('sites');
export const stackIndex = client.initIndex('stacks');

export const search = async (query: string, page = 1, indices = ['events', 'tags', 'clients']) => {
  const queries = indices.map(index => ({
    indexName: index,
    query,
    params: { page },
  }));

  const { results } = await client.multipleQueries(queries);
  return results;
}

const searchIndex = (index: SearchIndex) => async (query: string, page = 1) => {
  const { hits } = await index.search(query, { page });
  return hits;
}

export const searchNews = searchIndex(newsIndex);
export const searchEvents = searchIndex(eventIndex);
export const searchTags = searchIndex(tagIndex);
export const searchClients = searchIndex(clientIndex);
export const searchSites = searchIndex(siteIndex);
export const searchStacks = searchIndex(stackIndex);

export const add = <Type>(index: SearchIndex) => {
  function addUtil(object: Type): Promise<string>;
  function addUtil(objects: Type[]): Promise<string[]>;
  async function addUtil(objects: Type | Type[]) {
    if (Array.isArray(objects)) {
      const { objectIDs } = await index.saveObjects(objects);
      return objectIDs;
    }
    const { objectID } = await index.saveObject(objects);
    return objectID;
  }
  return addUtil;
}

export const addNews = add<News>(newsIndex);
export const addEvent = add<Event>(eventIndex);
export const addTag = add<Tag>(tagIndex);
export const addClient = add<Client>(clientIndex);
export const addSite = add<Site>(siteIndex);
export const addStack = add<Stack>(stackIndex);
