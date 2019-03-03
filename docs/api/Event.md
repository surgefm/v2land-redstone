# Event

## Event Object Model

| Property | Type |
|:---------|:-----|
| id | int | 
| name | string | 
| description | text |
| status | string |
| createdAt | string |
| updatedAt | string |
| lastAdmittedNewsId | int |
| latestAdmittedNews | News |
| stacks | Stacks[] |
| headerImage | HeaderImage associated |
| contribution | Record[] |
| lastUpdate | string |
| stackCount | int |
| temporaryStack | Stacks[] |
| newsCount | int |

Notice: Not all the properties above are returned at a specific response.

# Stack Object Model

| Property | Type |
|:---------|:-----|
| id | int | 
| title | string | 
| description | text |
| status | string |
| createdAt | string |
| updatedAt | string |
| order | int |
| time | string |
| eventId | int |
| news | News[] |
| newsCount | int |

---

## Create Event 创建事件

If the client is a manager, he can create the event directly.
Otherwise, the event will be pending and needs to be checked by a manager.

| Property | Value |
|:---------|:------|
| URL | /event |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Require Logging in | false |

### Post Data

| Property | Type | 
|:---------|:-----|
| name | string | 
| description | text |
| (other optional properties) |

### Return Data

201 Successfully created

| Property | Type | Description |
|:---------|:-----|:------------|
| message | string | 
| event | Event | the created event |

400 Missing parameter `name` or `description`

409 Event of the same name already exists

---

## Update Event 更新事件

| Property | Value |
|:---------|:------|
| URL | /event/{ eventName \| id } |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Require Logging in | true |
| Require Manager Authority | true |

### Post Data

| Property | Type |
|:---------|:-----|
| name | string | 
| description | text |
| status | string |

(All the properties above are optional.)

### Return Data

201 Successfully updated

| Property | Type |
|:---------|:-----|
| message | string | 
| event | Event |

200 Nothing happens

| Property | Type |
|:---------|:-----|
| message | string | 
| event | Event |

400 Missing parameter

404 Event not found

---

## Get Single Event 获取单个事件信息

| Property | Value |
|:---------|:------|
| URL | /event/{ eventName \| id } |
| Method | GET |
| Return Data Form | JSON |
| Require Logging in | false |

### Return Data

200 Successful

Event object

404 Event not found

---

## Get All Pending Events 获取待审核事件

| Property | Value |
|:---------|:------|
| URL | /event/pending |
| Method | GET |
| Return Data Form | JSON |
| Require Logging in | true |
| Require Manager Authority | true |

### Return Data

200 Successful

| Property | Type | Description |
|:---------|:-----|:------------|
| eventCollection | Event[] | An array of Event objects |

404 Event not found

---

## Get Pending News of a Particular Event 获取事件待审核新闻

| Property | Value |
|:---------|:------|
| URL | /event/{ eventName \| id }/pending |
| Method | GET |
| Return Data Form | JSON |
| Require Logging in | true |
| Require Manager Authority | true |

### Return Data

200 Successful

| Property | Type | Description |
|:---------|:-----|:------------|
| newsCollection | news[] | An array of Event objects |

400 Event not found

---

## Get Event List 获取事件列表

| Property | Value |
|:---------|:------|
| URL | /event/list |
| Method | POST |
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

200 Found events

| Property | Type | Description |
|:---------|:-----|:------------|
| eventList | event[] | An array of Event objects, including header images, maximum 10 |

---

## Create News 添加新闻

| Property | Value |
|:---------|:------|
| URL | /event/{ eventName \| id }/news |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Require Logging in | false |

管理员提交的新闻在未特别指明的情况下直接过审，普通用户及游客需要管理员审核。
News created by contributors and visitors requires revewing by a manager before being published. News created by managers does not require reviewing by default.

### Post Data

| Property | Type |
|:---------|:-----|
| url | url |
| time | time |
| title (optional) | string |
| abstract (optional) | string |

### Return Data

201 Successfully created

| Property | Type | Description |
|:---------|:-----|:------------|
| message | string |
| news | object | the created news |

400 Missing parameter `url`

404 Event not found

409 News of the same url already exists in the pending news queue

---

# Header Image

## Header Image Model

| Property | Type |
|:---------|:-----|
| imageUrl | url |
| source | string |
| sourceUrl (optional) | url |
| event | Event associated |

---

## Create Header Image 添加事件题图

| Property | Value |
|:---------|:------|
| URL | /event/{ eventName \| id }/header_image |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Require Logging in | false |

### Post Data

| Property | Type |
|:---------|:-----|
| imageUrl | url |
| source | string |
| sourceUrl (optional) | url |

### Return Data

201 Successfully created

| Property | Type | Description |
|:---------|:-----|:------------|
| message | string |
| headerImage | object |  |

404 Event not found

400 Header image already exists

---

## Update Header Image 修改事件题图

| Property | Value |
|:---------|:------|
| URL | /event/{ eventName \| id }/header_image |
| Method | PUT |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Require Logging in | true |
| Require Manager Authority | true |

### Post Data

| Property | Type |
|:---------|:-----|
| imageUrl | url |
| source | string |
| sourceUrl | url |

### Return Data

201 Successfully updated

| Property | Type | Description |
|:---------|:-----|:------------|
| message | string |
| headerImage | object | the updated header image |

404 Event not found

400 Header image already exists
