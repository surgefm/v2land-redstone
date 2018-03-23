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

## Subscribe

| Property | Value |
|:---------|:------|
| URL | /subscription/{ eventName } |
| Method | POST |
| Post Data Form | JSON |

### Post Data

| Property | Type |
|:---------|:-----|
| mode | string |
| method | string |
| contact | json |

### Return Data

400 Missing `mode` or `contact` parameter

| Property | Type |
|:---------|:-----|
| message | string |

404 Subscribing mode not found

| Property | Type |
|:---------|:-----|
| message | string |

406 Not admitted

| Property | Type |
|:---------|:-----|
| message | string |

200 Same subscription has already existed

| Property | Type |
|:---------|:-----|
| message | string |

201 Unsubscribe successfully

| Property | Type |
|:---------|:-----|
| name | string |
| message | string |
| subscriptionList (unavilable when empty list) | Subscription[] |

---

## Unsubscribe

| Property | Value |
|:---------|:------|
| URL | /unsubscribe |
| Method | GET |
| Post Data Form | JSON |

### Post Data

| Property | Type |
|:---------|:-----|
| unsubscribeId | number |

### Return Data

400 Missing `id` or `unsubscribeId` parameter

| Property | Type |
|:---------|:-----|
| message | string |

404 Subsciption not found

| Property | Type |
|:---------|:-----|
| message | string |

201 Unsubscribe successfully

| Property | Type |
|:---------|:-----|
| name | string |
| message | string |
| subscriptionList (unavilable when empty list) | Subscription[] |