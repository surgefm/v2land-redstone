# Event

## Event Object Model

| Property | Type |
|:---------|:-----|
| name | string | 
| description | text |
| status | string |
| subscribers | Client collection |
| news | News collection |
| headerImage | HeaderImage associated |
| notifications | Notification collection |
| subscriptions | Subscription collection |

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
| event | event | the created event |

400 Missing parameter `name` or `description`

409 Event of the same name already exists

---

## Update Event 更新事件

| Property | Value |
|:---------|:------|
| URL | /event/{ eventName } |
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
| event | event |

200 Nothing happens

| Property | Type |
|:---------|:-----|
| message | string | 
| event | event |

400 Missing parameter

404 Event not found

---

## Get Single Event 获取单个事件信息

| Property | Value |
|:---------|:------|
| URL | /event/{ eventName } |
| Method | GET |
| Return Data Form | JSON |
| Require Logging in | false |

### Return Data

200 Successful

| Property | Type |
|:---------|:-----|
| event | event |

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
| eventCollection | event[] | An array of Event objects |

404 Event not found

---

## Get Pending News of a Particular Event 获取事件待审核新闻

| Property | Value |
|:---------|:------|
| URL | /event/{ eventName }/pending |
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
| where (optional) | object |

"Where" is a filter for events. Only the events that have exactly the same properties as "where" will be returned.

### Return Data

200 Found events

| Property | Type | Description |
|:---------|:-----|:------------|
| eventList | event[] | An array of Event objects, including header images, maximum 10 |

---

## Create News 添加新闻

| Property | Value |
|:---------|:------|
| URL | /event/{ eventName }/news |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Require Logging in | false |

### Post Data

| Property | Type |
|:---------|:-----|
| url | url |

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
| sourceUrl | url |
| event | Event associated |

---

## Create Header Image 添加事件题图

| Property | Value |
|:---------|:------|
| URL | /event/{ eventName }/header_image |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Require Logging in | false |

### Post Data

| Property | Type |
|:---------|:-----|
| imageUrl | url |
| source | string |
| sourceUrl | url |

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
| URL | /event/{ eventName }/header_image |
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
