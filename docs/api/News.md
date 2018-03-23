# News

## Update News

| Property | Value |
|:---------|:------|
| URL | /{ News ID } |
| Method | PUT |
| Post Data Form | JSON |
| Return Data Form | JSON |

### Post Data

| Property | Type |
|:---------|:------|
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

Array of News

---

## Get Next Page of News

| Property | Value |
|:---------|:------|
| URL | /news |
| Method | PUT |
| Post Data Form | JSON |
| Return Data Form | JSON |


### Post Data (Optional)

| Property | Type |
|:---------|:------|
| page | number |

### URL Query Data

| Property | Type | Description |
|:---------|:-----|:------|
| where | object | News Filter. Only the news that have exactly the same properties as "where" will be returned |

### Return Data

Array of News, maximum 15
