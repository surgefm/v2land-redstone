# Subscription

## Subscription Object Model
| Property | Type | description |
|:---------|:-----|:------------|
| mode | string |
| method | string | twitter / weibo / twitterAt / weiboAt / email |
| contact | json |
| status (optional) | string | active / unsubscribed / failed |
| unsubscribeId | string |
| subscriber (optional) | client associated |
| event (optional) | event associated |
| notification (optional) | notification associated |

---

## Subscribe 添加订阅

| Property | Value |
|:---------|:------|
| URL | /subscription/{ eventName } |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Require Logging in | false |

### Post Data

| Property | Type |
|:---------|:-----|
| mode | string |
| method | string |
| contact | JSON |

### Return Data

201 Unsubscribe successfully

| Property | Type |
|:---------|:-----|
| name | string |
| message | string |
| subscriptionList (unexistent when empty list) | subscription[] |

200 Same subscription already exists

400 Missing parameter `mode` or `contact`

404 Subscription mode not found

406 This event cannot be subscribed currently 

---

## Unsubscribe 取消订阅

| Property | Value |
|:---------|:------|
| URL | /unsubscribe |
| Method | GET |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Require Logging in | false |

### Post Data

| Property | Type |
|:---------|:-----|
| unsubscribeId | number |

### Return Data

201 Success

| Property | Type |
|:---------|:-----|
| name | string |
| message | string |
| subscriptionList (unavilable when empty list) | Subscription[] |

400 Missing `id` or `unsubscribeId` parameter

404 Subsciption not found
