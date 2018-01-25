# Auth

## Options
Get the available third-party authorization option list.

| Property | Value |
|:---------|:------|
| URL | /auth/options |
| Method | GET |
| Return Data Form | JSON |
| Required Logged in | false |

### Return Data
#### 200 Fetch the list successfully
| Property | Type |
|:---------|:------|
| twitter | boolean |
| weibo | boolean |

## Authorize
The authorization does not complete automatically in some occasions, mostly because the client was not logged in during the authorization step or the third-party account has already been authorized to another client. In these cases, the authorization has to be completed manually.

**The `authId` property is an integer value the client receives when the authorization fails for non-technical reasons, indicating which `Auth` record Redstone needs to look up.**

| Property | Value |
|:---------|:------|
| URL | /auth |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Required Logged in | true |

### Post Data

| Property | Type |
|:---------|:-----|
| authId | string |

### Return Data
#### 201 Authorize successfully
| Property | Type |
|:---------|:------|
| message | string |

#### 400 Missing `authId`
| Property | Type |
|:---------|:------|
| message | string |

#### 403 Permission denied as the `Auth` record doesn't belong to the client
| Property | Type |
|:---------|:------|
| message | string |

#### 403 The authentication has expired. A new authentication request is thereby needed
| Property | Type |
|:---------|:------|
| message | string |

#### 404 `Auth` record not found. Please make sure you send the correct `authId`
| Property | Type |
|:---------|:------|
| message | string |

## Unauthorize
Disconnect the client from a third-party account.

| Property | Value |
|:---------|:------|
| URL | /auth |
| Method | DELETE |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Required Logged in | true |

### Post Data

| Property | Type |
|:---------|:-----|
| authId | string |

### Return Data
#### 201 Unauthorize successfully
| Property | Type |
|:---------|:------|
| message | string |

#### 400 Missing `authId`
| Property | Type |
|:---------|:------|
| message | string |

#### 403 Permission denied as the `Auth` record does not belong to the client
| Property | Type |
|:---------|:------|
| message | string |

#### 404 `Auth` record not found. Please make sure you send the correct `authId`
| Property | Type |
|:---------|:------|
| message | string |

## Twitter
Redirect the client to Twitter's OAuth page.

| Property | Value |
|:---------|:------|
| URL | /auth/twitter |
| Method | GET |
| Required Logged in | false |

### Return Data
#### 307 Successfully redirect the client to Twitter's OAuth page.
#### 503 The site has not enabled Twitter authentication.
If you are the website maintainer and want to enable Twitter authentication, please configure `TWITTER_KEY` and `TWITTER_SECRET` as your environment variables. You can find both values by creating an app on [Twitter Application Management](https://apps.twitter.com/).

## Twitter Callback
The callback API Twitter redirect the client to after the client authorize our site to visit his or her Twitter account.

_When redirecting, Twitter will add two properties in the URL query: `oauth_token` and `oauth_verifier`, which allow Redstone to authenticate with Twitter.

| Property | Value |
|:---------|:------|
| URL | /auth/twitter/callback |
| Method | GET |
| Required Logged in | false |

### Query Data

| Property | Type |
|:---------|:-----|
| oauth_token | string |
| oauth_verifier | string |

### Return Data
#### 200 Redstone will return a webpage which redirects the client to `/auth/twitter/redirect`
The reason the client needs to be redirected to an HTML page is that Twitter will request `/auth/twitter/callback` repeatedly when the client stays on its OAuth page. If we don't send the client to a new webpage ASAP (the authentication with Twitter on Redstone takes time), there's a chance that the client get stuck at Twitter's page.

#### 400 Missing `oauth_token` or `oauth_verifier`
| Property | Type |
|:---------|:------|
| message | string |

## Twitter Redirect
Authenticate with Twitter and start the authorization procedure. The client should not request this API manually. It's all done automatically by `/auth/twitter/callback`.

| Property | Value |
|:---------|:------|
| URL | /auth/twitter/redirect |
| Method | GET |
| Required Logged in | false |

### Query Data

| Property | Type | Description |
|:---------|:-----|:------------|
| token | string | The `oauth_token` in `/auth/twitter/callback` request. |
| verifier | string | The `oauth_verifier` in `/auth/twitter/callback` request. |

### Return Data
#### 201 Authorize successfully
| Property | Type |
|:---------|:------|
| message | string |

#### 202 Client authentication required. Please manually authorize the third-party account after logging in within 12 hours.
| Property | Type | Value |
|:---------|:------|:-----|
| name | string | 'authentication required' |
| message | string | |
| authId | integer | |

#### 202 The third-party account has already connected to another client. If the client still want to proceed the procedure, please manually authorize the third-party account.
| Property | Type | Value |
|:---------|:------|:-----|
| name | string | 'already connected' |
| message | string | |
| authId | integer | |

## Weibo
Redirect the client to Sina Weibo's OAuth page.

| Property | Value |
|:---------|:------|
| URL | /auth/weibo |
| Method | GET |
| Required Logged in | false |

### Return Data
#### 307 Successfully redirect the client to Weibo's OAuth page.
#### 503 The site has not enabled Weibo authentication.
If you are the website maintainer and want to enable Weibo authentication, please configure `WEIBO_KEY` and `WEIBO_SECRET` as your environment variables. You can find both values by creating an app on [微博开放平台](http://open.weibo.com/).

## Weibo Callback
The callback API Weibo redirect the client to after the client authorize our site to visit his or her Weibo account.

_When redirecting, Weibo will add two properties in the URL query: `code` and `state`, which allow Redstone to authenticate with Weibo.

| Property | Value |
|:---------|:------|
| URL | /auth/weibo/callback |
| Method | GET |
| Required Logged in | false |

### Query Data

| Property | Type |
|:---------|:-----|
| code | string |
| state | string |

### Return Data
#### 200 Redstone will return a webpage which redirects the client to `/auth/weibo/redirect`
#### 400 Missing `code` or `state`
| Property | Type |
|:---------|:------|
| message | string |

## Weibo Redirect
Authenticate with Weibo and start the authorization procedure. The client should not request this API manually. It's all done automatically by `/auth/weibo/callback`.

| Property | Value |
|:---------|:------|
| URL | /auth/weibo/redirect |
| Method | GET |
| Required Logged in | false |

### Query Data

| Property | Type | Description |
|:---------|:-----|:------------|
| code | string | The `code` in `/auth/weibo/callback` request. |
| authId | string | The `state` in `/auth/weibo/callback` request. |

### Return Data
#### 201 Authorize successfully
| Property | Type |
|:---------|:------|
| message | string |

#### 202 Client authentication required. Please manually authorize the third-party account after logging in within 12 hours.
| Property | Type | Value |
|:---------|:------|:-----|
| name | string | 'authentication required' |
| message | string | |
| authId | integer | |

#### 202 The third-party account has already connected to another client. If the client still want to proceed the procedure, please manually authorize the third-party account.
| Property | Type | Value |
|:---------|:------|:-----|
| name | string | 'already connected' |
| message | string | |
| authId | integer | |
