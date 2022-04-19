import algoliasearch, { SearchIndex } from 'algoliasearch';
import { News, Event, Stack, Site, Tag, Client } from '@Models';
import { EventObj, StackObj } from '@Types';

const useAlgolia = process.env.ALGOLIA_APPID && process.env.ALGOLIA_API_KEY;
export const client = algoliasearch(process.env.ALGOLIA_APPID, process.env.ALGOLIA_API_KEY);
export const newsIndex = client.initIndex('news');
export const eventIndex = client.initIndex('events');
export const clientIndex = client.initIndex('clients');
export const tagIndex = client.initIndex('tags');
export const siteIndex = client.initIndex('sites');
export const stackIndex = client.initIndex('stacks');

export const search = async (query: string, page = 1, indices = ['events', 'tags', 'clients']) => {
  if (!useAlgolia) return [];

  const queries = indices.map(index => ({
    indexName: index,
    query,
    params: { page },
  }));

  const { results } = await client.multipleQueries(queries);
  return results;
};

const searchIndex = (index: SearchIndex) => async (query: string, page = 1) => {
  if (!useAlgolia) return [];
  const { hits } = await index.search(query, { page });
  return hits;
};

export const searchNews = searchIndex(newsIndex);
export const searchEvents = searchIndex(eventIndex);
export const searchTags = searchIndex(tagIndex);
export const searchClients = searchIndex(clientIndex);
export const searchSites = searchIndex(siteIndex);
export const searchStacks = searchIndex(stackIndex);

const getPlainHelper = (obj: any) => {
  if (Array.isArray(obj)) {
    return obj.map(object => getPlain(object)) as Record<string, any>[];
  }
  if (typeof (obj as any).get === 'function') {
    return (obj as any).get({ plain: true }) as Record<string, any>;
  }
  return obj as Record<string, any>;
};

function getPlain(objects: any): Record<string, any> {
  return getPlainHelper(objects) as Record<string, any>;
}

function getPlains(objects: any): Record<string, any>[] {
  return getPlainHelper(objects) as Record<string, any>[];
}


const add = <Type>(index: SearchIndex) => {
  function addUtil(object: Type): Promise<string>;
  function addUtil(objects: Type[]): Promise<string[]>;
  async function addUtil(objects: Type | Type[]) {
    if (!useAlgolia) return;
    if (Array.isArray(objects)) {
      const { objectIDs } = await index.saveObjects(getPlains(objects));
      return objectIDs;
    }
    const { objectID } = await index.saveObject(getPlain(objects));
    return objectID;
  }
  return addUtil;
};

export const addNews = add<News>(newsIndex);
export const addEvent = add<Event | EventObj>(eventIndex);
export const addTag = add<Tag>(tagIndex);
export const addClient = add<Client>(clientIndex);
export const addSite = add<Site>(siteIndex);
export const addStack = add<Stack | StackObj>(stackIndex);


const update = <Type>(index: SearchIndex) => {
  function updateUtil(object: Type): Promise<string>;
  function updateUtil(objects: Type[]): Promise<string[]>;
  async function updateUtil(objects: Type | Type[]) {
    if (!useAlgolia) return;
    if (Array.isArray(objects)) {
      const { objectIDs } = await index.partialUpdateObjects(getPlains(objects), {
        createIfNotExists: true,
      });
      return objectIDs;
    }
    const { objectID } = await index.partialUpdateObject(getPlain(objects), {
      createIfNotExists: true,
    });
    return objectID;
  }
  return updateUtil;
};

export const updateNews = update<News>(newsIndex);
export const updateEvent = update<Event | EventObj>(eventIndex);
export const updateTag = update<Tag>(tagIndex);
export const updateClient = update<Client>(clientIndex);
export const updateSite = update<Site>(siteIndex);
export const updateStack = update<Stack | StackObj>(stackIndex);
