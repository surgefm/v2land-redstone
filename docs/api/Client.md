# Client

## Login

| Property | Value |
|:---------|:------|
| URL | /client/login |
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

## Change Password

| Property | Value |
|:---------|:------|
| URL | /client/change_password |
| Method | PUT |

### Post Data

| Property | Type |
|:---------|:------|
| password | string |

### Return Data

| Property | Type |
|:---------|:------|
| message | string |

## Logout

| Property | Value |
|:---------|:------|
| URL | /client/logout |
| Method | * |

### Return Data

| Property | Type |
|:---------|:-----|
| message | string |

## Register

| Property | Value |
|:---------|:------|
| URL | /client/register |
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
