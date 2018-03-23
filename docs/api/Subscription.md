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
| URL | /{ eventName } |
| Method | POST |
| Post Data Form | JSON |

### Post Data

| Property | Type |
|:---------|:-----|
| mode | string |
| method | string |
| contact | json |

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
