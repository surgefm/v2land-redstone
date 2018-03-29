# Upload

| Property | Value |
|:---------|:------|
| URL | /upload |
| Method | POST |
| Post Data Form | JSON |
| Return Data Form | JSON |
| Require Logging in | true |
| Require Manager Authority | true |

### Post Data

| Property | Type |
|:---------|:-----|
| file | file parameter |

### Return Data

201 Successful

| Property | Type  | description |
|:---------|:------|:------------|
| message | string |
| name | string | filename |

503 Upload function is not supported currently