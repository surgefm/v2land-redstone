import algoliasearch, { SearchIndex } from 'algoliasearch';
import { News, Event, Stack, Site, Tag, Client } from '@Models';
import * as ClientService from '../ClientService';
import { EventObj, StackObj } from '@Types';

type PreprocessFn = (t: Record<string, any>) => Record<string, any>;

interface Id extends Record<string, any> {
  id: number;
}

interface ObjectID extends Record<string, any> {
  objectID: number;
}

type IdObject = Id | ObjectID;

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

const getPlainHelper = (obj: any) => {
  if (Array.isArray(obj)) {
    return obj.map(object => getPlain(object)) as Record<string, any>[];
  }
  if (typeof obj.get === 'function') {
    obj = obj.get({ plain: true }) as Record<string, any>;
  }
  if (typeof obj.objectID === 'undefined') {
    obj.objectID = obj.id;
  }
  return obj as Record<string, any>;
};

function getPlain(objects: any, preprocess: PreprocessFn = a => a): Record<string, any> {
  return preprocess(getPlainHelper(objects)) as Record<string, any>;
}

function getPlains(objects: any, preprocess: PreprocessFn = a => a): Record<string, any>[] {
  return getPlainHelper(objects).map(preprocess) as Record<string, any>[];
}

const add = <Type>(index: SearchIndex, preprocess: PreprocessFn = a => a) => {
  function addUtil(object: Type): Promise<string>;
  function addUtil(objects: Type[]): Promise<string[]>;
  async function addUtil(objects: Type | Type[]) {
    if (!useAlgolia) return;
    if (Array.isArray(objects)) {
      const { objectIDs } = await index.saveObjects(getPlains(objects, preprocess));
      return objectIDs;
    }
    const { objectID } = await index.saveObject(getPlain(objects, preprocess));
    return objectID;
  }
  return addUtil;
};


const update = <Type>(index: SearchIndex, preprocess: PreprocessFn = a => a) => {
  function updateUtil(object: Type): Promise<string>;
  function updateUtil(objects: Type[]): Promise<string[]>;
  async function updateUtil(objects: Type | Type[]) {
    if (!useAlgolia) return;
    if (Array.isArray(objects)) {
      const { objectIDs } = await index.partialUpdateObjects(getPlains(objects, preprocess), {
        createIfNotExists: true,
      });
      return objectIDs;
    }
    const { objectID } = await index.partialUpdateObject(getPlain(objects, preprocess), {
      createIfNotExists: true,
    });
    return objectID;
  }
  return updateUtil;
};


const del = (index: SearchIndex) => {
  const getId = (object: number | IdObject) => {
    if (typeof object === 'number') return `${object}`;
    if (typeof (object as any).id === 'undefined') return `${(object as ObjectID).objectID}`;
    return `${(object as Id).id}`;
  };

  async function delUtil(objectIDs: number | number[] | IdObject | IdObject[]) {
    if (Array.isArray(objectIDs)) {
      return index.deleteObjects(objectIDs.map(getId));
    }
    return index.deleteObject(getId(objectIDs));
  }

  return delUtil;
};


export const searchNews = searchIndex(newsIndex);
export const searchEvents = searchIndex(eventIndex);
export const searchTags = searchIndex(tagIndex);
export const searchClients = searchIndex(clientIndex);
export const searchSites = searchIndex(siteIndex);
export const searchStacks = searchIndex(stackIndex);

export const addNews = add<News>(newsIndex);
export const addEvent = add<Event | EventObj>(eventIndex);
export const addTag = add<Tag>(tagIndex);
export const addClient = add<Client>(clientIndex, ClientService.sanitizeClient);
export const addSite = add<Site>(siteIndex);
export const addStack = add<Stack | StackObj>(stackIndex);

export const updateNews = update<News>(newsIndex);
export const updateEvent = update<Event | EventObj>(eventIndex);
export const updateTag = update<Tag>(tagIndex);
export const updateClient = update<Client>(clientIndex, ClientService.sanitizeClient);
export const updateSite = update<Site>(siteIndex);
export const updateStack = update<Stack | StackObj>(stackIndex);

export const deleteNews = del(newsIndex);
export const deleteEvent = del(eventIndex);
export const deleteTag = del(tagIndex);
export const deleteClient = del(clientIndex);
export const deleteSite = del(siteIndex);
export const deleteStack = del(stackIndex);
