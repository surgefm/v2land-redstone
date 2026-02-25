import { z } from 'zod';

export const setEventSchema = {
  eventId: z.number().describe('The event ID to work with for subsequent tool calls'),
};

export const getCurrentStacksSchema = {
  eventId: z.number().optional().describe('Event ID (uses session default if set via set_event)'),
};

export const createStackSchema = {
  eventId: z.number().optional().describe('Event ID (uses session default if set via set_event)'),
  title: z.string().describe('Brief title describing this development'),
  description: z.string().describe('Factual, detailed summary of what happened (2-4 sentences)'),
  time: z.string().describe('When the development took place (ISO 8601 format, e.g. "2025-01-15T14:30:00Z")'),
  order: z.number().optional().describe('Display order (higher = more recent, default -1 for auto)'),
};

export const addNewsToEventSchema = {
  eventId: z.number().optional().describe('Event ID (uses session default if set via set_event)'),
  url: z.string().describe('URL of the news article'),
  source: z.string().describe('Name of the news source/outlet'),
  title: z.string().describe('Title of the news article'),
  abstract: z.string().optional().describe('Brief summary of the article (max 200 chars)'),
  time: z.string().describe('Publication time (ISO 8601 format)'),
  stackId: z.number().optional().describe('ID of the stack to add this news to (optional, omit to add off-shelf)'),
};

export const addNewsToStackSchema = {
  eventId: z.number().optional().describe('Event ID (uses session default if set via set_event)'),
  newsId: z.number().describe('ID of the news item to move'),
  stackId: z.number().describe('ID of the stack to add the news to'),
};

export const updateStackSchema = {
  eventId: z.number().optional().describe('Event ID (uses session default if set via set_event)'),
  stackId: z.number().describe('ID of the stack to update'),
  description: z.string().optional().describe('New description for the stack'),
  title: z.string().optional().describe('New title for the stack'),
  time: z.string().optional().describe('New date/time for the development (ISO 8601 format)'),
};

export const reorderStacksSchema = {
  eventId: z.number().optional().describe('Event ID (uses session default if set via set_event)'),
  stackIds: z.array(z.number()).describe('Array of stack IDs in desired display order (most recent first)'),
};

export const sendChatMessageSchema = {
  eventId: z.number().optional().describe('Event ID (uses session default if set via set_event)'),
  text: z.string().describe('Message text to send to the newsroom'),
};

export const createEventSchema = {
  name: z.string().describe('Name of the event/timeline to create (must be unique)'),
  description: z.string().describe('Description of the event'),
};

export const getNewsroomLinkSchema = {
  eventId: z.number().optional().describe('Event ID (uses session default if set via set_event)'),
};

export const updateEventSchema = {
  eventId: z.number().optional().describe('Event ID (uses session default if set via set_event)'),
  name: z.string().optional().describe('New name for the event'),
  description: z.string().optional().describe('New description for the event'),
};

export const removeNewsFromStackSchema = {
  eventId: z.number().optional().describe('Event ID (uses session default if set via set_event)'),
  newsId: z.number().describe('ID of the news item to move back to off-shelf'),
  stackId: z.number().describe('ID of the stack to remove the news from'),
};

export const searchEventsSchema = {
  query: z.string().describe('Search query to find events/timelines in the database'),
  page: z.number().optional().describe('Page number for pagination (default 1)'),
};

export const getEditorialGuidelinesSchema = {};

export const getFollowedEditableEventsSchema = {};

export const getOwnedEditableEventsSchema = {};
