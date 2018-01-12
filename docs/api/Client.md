# Client

## Login

| Property | Value |
|:---------|:------|
| URL | /login |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |

### Post Data

| Property | Type |
|:---------|:------|
| username | string |
| password | string |

### Return Data

| Property | Type |
|:---------|:------|
| message | string |

## Logout

| Property | Value |
|:---------|:------|
| URL | /logout |
| Method | * |

### Return Data

| Property | Type |
|:---------|:-----|
| message | string |

## Register

| Property | Value |
|:---------|:------|
| URL | /register |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |

### Post Data

| Property | Type |
|:---------|:------|
| username | string |
| password | string |

### Return Data

| Property | Type |
|:---------|:------|
| message | string |

## Get Client Detail

| Property | Value |
|:---------|:------|
| URL | /client/me |
| Method | GET |

### Return Data

| Property | Type |
|:---------|:------|
| username | string |
| id | number |
| createdAt | Date |
| updatedAt | Date |
