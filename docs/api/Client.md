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

200 Success

401 Wrong combination of username, Email, or password

404 Client not found

----

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

201 Success

404 Parameter error

500 Server Error, or client not found, or permission denied

---

## Logout

| Property | Value |
|:---------|:------|
| URL | /client/logout |
| Method | * |

### Return Data

| Property | Type |
|:---------|:-----|
| message | string |

200 Success

---

## Register

| Property | Value |
|:---------|:------|
| URL | /client/register |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |

### Post Data

| Property | Type |
|:---------|:-----|
| username | string |
| password | string |
| email | email |

### Return Data

| Property | Type |
|:---------|:-----|
| message | string |

201 Success

406 This username or Email has already been used by another client

500 Error occurs when generating salt or hash

---

## Get Client Detail

| Property | Value |
|:---------|:------|
| URL | /client/me |
| Method | GET |

### Return Data

200 Success

| Property | Type |
|:---------|:------|
| username | string |
| id | number |
| createdAt | Date |
| updatedAt | Date |

401 Not logged in

404 Client not found
