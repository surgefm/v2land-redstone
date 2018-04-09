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
| event (optional) | Event |

---

## Update News 更新新闻

| Property | Value |
|:---------|:------|
| URL | /news/{ News ID } |
| Method | PUT |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Require Logging in | true |
| Require Manager Authority | true |

### Post Data

| Property | Type |
|:---------|:-----|
| url | url |
| source | string |
| title | string |
| abstract | text |
| time | date |
| status | string |

(All the properties above are optional. The unposted properties mean that it does not need to be changed.)

### Return Data

200 Nothing happens

| Property | Type |
|:---------|:-----|
| message | string | 
| news | news |

201 Successful

| Property | Type | Description |
|:---------|:-----|:------------|
| message | string | 
| news | news | the updated news |

404 News not found

---

## Get All Pending News of All Events 获取待审核新闻列表

| Property | Value |
|:---------|:------|
| URL | /news/pending |
| Method | GET |
| Return Data Form | JSON |
| Require Logging in | true |
| Require Manager Authority | true |

### Return Data

200 Successful

| Property | Type | Description |
|:---------|:-----|:------------|
| newsCollection | news[] | An array of news objects |

---

## Get Next Page of News 获取新闻列表（分页）

| Property | Value |
|:---------|:------|
| URL | /news |
| Method | POST or GET |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Require Logging in | false |

### Post Data 

| Property | Type |
|:---------|:------|
| page (optional) | number |
| where | object |

"Where" is a query criteria object. See [Waterline query language](https://sailsjs.com/documentation/concepts/models-and-orm/query-language) for detail.

### Return Data

200 Successful 

| Property | Type | Description |
|:---------|:-----|:------------|
| newsList | news[] | An array of News objects, maximum 15 |

400 Missing parameter `where`
