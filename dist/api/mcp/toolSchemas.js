"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnedEditableEventsSchema = exports.getFollowedEditableEventsSchema = exports.getEditorialGuidelinesSchema = exports.searchEventsSchema = exports.removeNewsFromStackSchema = exports.updateEventSchema = exports.getNewsroomLinkSchema = exports.createEventSchema = exports.sendChatMessageSchema = exports.reorderStacksSchema = exports.updateStackSchema = exports.addNewsToStackSchema = exports.addNewsToEventSchema = exports.createStackSchema = exports.getCurrentStacksSchema = exports.setEventSchema = void 0;
const zod_1 = require("zod");
exports.setEventSchema = {
    eventId: zod_1.z.number().describe('The event ID to work with for subsequent tool calls'),
};
exports.getCurrentStacksSchema = {
    eventId: zod_1.z.number().optional().describe('Event ID (uses session default if set via set_event)'),
};
exports.createStackSchema = {
    eventId: zod_1.z.number().optional().describe('Event ID (uses session default if set via set_event)'),
    title: zod_1.z.string().describe('Brief title describing this development'),
    description: zod_1.z.string().describe('Factual, detailed summary of what happened (2-4 sentences)'),
    time: zod_1.z.string().describe('When the development took place (ISO 8601 format, e.g. "2025-01-15T14:30:00Z")'),
    order: zod_1.z.number().optional().describe('Display order (higher = more recent, default -1 for auto)'),
};
exports.addNewsToEventSchema = {
    eventId: zod_1.z.number().optional().describe('Event ID (uses session default if set via set_event)'),
    url: zod_1.z.string().describe('URL of the news article'),
    source: zod_1.z.string().describe('Name of the news source/outlet'),
    title: zod_1.z.string().describe('Title of the news article'),
    abstract: zod_1.z.string().optional().describe('Brief summary of the article (max 200 chars)'),
    time: zod_1.z.string().describe('Publication time (ISO 8601 format)'),
    stackId: zod_1.z.number().optional().describe('ID of the stack to add this news to (optional, omit to add off-shelf)'),
};
exports.addNewsToStackSchema = {
    eventId: zod_1.z.number().optional().describe('Event ID (uses session default if set via set_event)'),
    newsId: zod_1.z.number().describe('ID of the news item to move'),
    stackId: zod_1.z.number().describe('ID of the stack to add the news to'),
};
exports.updateStackSchema = {
    eventId: zod_1.z.number().optional().describe('Event ID (uses session default if set via set_event)'),
    stackId: zod_1.z.number().describe('ID of the stack to update'),
    description: zod_1.z.string().optional().describe('New description for the stack'),
    title: zod_1.z.string().optional().describe('New title for the stack'),
    time: zod_1.z.string().optional().describe('New date/time for the development (ISO 8601 format)'),
};
exports.reorderStacksSchema = {
    eventId: zod_1.z.number().optional().describe('Event ID (uses session default if set via set_event)'),
    stackIds: zod_1.z.array(zod_1.z.number()).describe('Array of stack IDs in desired display order (most recent first)'),
};
exports.sendChatMessageSchema = {
    eventId: zod_1.z.number().optional().describe('Event ID (uses session default if set via set_event)'),
    text: zod_1.z.string().describe('Message text to send to the newsroom'),
};
exports.createEventSchema = {
    name: zod_1.z.string().describe('Name of the event/timeline to create (must be unique)'),
    description: zod_1.z.string().describe('Description of the event'),
};
exports.getNewsroomLinkSchema = {
    eventId: zod_1.z.number().optional().describe('Event ID (uses session default if set via set_event)'),
};
exports.updateEventSchema = {
    eventId: zod_1.z.number().optional().describe('Event ID (uses session default if set via set_event)'),
    name: zod_1.z.string().optional().describe('New name for the event'),
    description: zod_1.z.string().optional().describe('New description for the event'),
};
exports.removeNewsFromStackSchema = {
    eventId: zod_1.z.number().optional().describe('Event ID (uses session default if set via set_event)'),
    newsId: zod_1.z.number().describe('ID of the news item to move back to off-shelf'),
    stackId: zod_1.z.number().describe('ID of the stack to remove the news from'),
};
exports.searchEventsSchema = {
    query: zod_1.z.string().describe('Search query to find events/timelines in the database'),
    page: zod_1.z.number().optional().describe('Page number for pagination (default 1)'),
};
exports.getEditorialGuidelinesSchema = {};
exports.getFollowedEditableEventsSchema = {};
exports.getOwnedEditableEventsSchema = {};

//# sourceMappingURL=toolSchemas.js.map
