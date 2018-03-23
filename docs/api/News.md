# News

## News Object Model

| Property | Type | Description |
|:---------|:-----|:------------|
| url | url |
| source | string |
| title | string |
| abstract | text |
| time | date |
| status (optional) | string | pending / admitted / rejected / removed |
| comment (optional) | text |
| event (optional) | Event | |

---

## Update News

| Property | Value |
|:---------|:------|
| URL | /{ News ID } |
| Method | PUT |
| Post Data Form | JSON |
| Return Data Form | JSON |

### Post Data

| Property | Type |
|:---------|:-----|
| url | url |
| source | string |
| title | string |
| abstract | text |
| time | date |
| status | string |

**(All properties are optional. The unposted properties mean that it does not need to be changed.)**

---

## Get All Pending News of All Events

| Property | Value |
|:---------|:------|
| URL | /pending |
| Method | GET |
| Return Data Form | JSON |

### Return Data

An array of News objects

---

## Get Next Page of News

| Property | Value |
|:---------|:------|
| URL | /news |
| Method | POST or GET |
| Post Data Form | JSON |
| Return Data Form | JSON |

### Post Data 

| Property | Type |
|:---------|:------|
| page (optional) | number |
| where (optional) | object |

This is a filter for news. Only the news that have exactly the same properties as "where" will be returned.

### Return Data

An array of News objects, maximum 15
