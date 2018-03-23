# Event

## Event Object Model

| Property | Type | Description |
|:---------|:-----|:------------|
| name | string | 
| description | text |
| status | string |
| subscribers | Client collection |
| news | News collection |
| headerImage | HeaderImage associated |
| notifications | Notification collection |
| subscriptions | Subscription collection |

---

## Create Event

| Property | Value |
|:---------|:------|
| URL | / |
| Method | POST |
| Post Data Form | JSON |

### Post Data

| Property | Type | 
|:---------|:-----|:------------|
| name | string | 
| description | text |
| other optional properties |

---

## Update Event

| Property | Value |
|:---------|:------|
| URL | /{ eventName } |
| Method | POST |
| Post Data Form | JSON |

### Post Data

| Property | Type |
|:---------|:-----|:------------|
| name | string | 
| description | text |
| status | string |

---

## Get Single Event

| Property | Value |
|:---------|:------|
| URL | /{ eventName } |
| Method | GET |
| Return Data Form | JSON |

### Return Data

A complete Event object

---

## Get All Pending Events

| Property | Value |
|:---------|:------|
| URL | /pending |
| Method | GET |
| Return Data Form | JSON |

### Return Data

An array of Event objects

---

## Get Pending News of a Particular Event

| Property | Value |
|:---------|:------|
| URL | /{ eventName }/pending |
| Method | GET |
| Return Data Form | JSON |

### Return Data

An array of News objects

---

## Get Event List

| Property | Value |
|:---------|:------|
| URL | /list |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |

### Post Data

| Property | Type |
|:---------|:------|
| page (optional) | number |
| where (optional) | object |

"Where" is a filter for events. Only the events that have exactly the same properties as "where" will be returned.

### Return Data

An array of Event objects, including header image, maximum 10

---

## Create News

| Property | Value |
|:---------|:------|
| URL | /{ eventName }/news |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |

### Post Data

| Property | Type |
|:---------|:-----|
| url | url |

### Return Data
JSON result of SQLService.create()

---

## Header Image Model

| Property | Type |
|:---------|:-----|
| imageUrl | url |
| source | string |
| sourceUrl | url |
| event | Event associated |

---

## Create or Update Header Image

| Property | Value |
|:---------|:------|
| URL | /{ eventName }/header_image |
| Method | POST or PUT |
| Post Data Form | JSON |
| Return Data Form | JSON |

### Post Data

| Property | Type |
|:---------|:-----|
| imageUrl | url |
| source | string |
| sourceUrl | url |

### Return Data
JSON result of SQLService.create() or SQLService.update() 