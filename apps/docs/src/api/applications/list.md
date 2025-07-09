# `GET /applications`

:::warning
🔒 This endpoint requires authorization.
:::

## Overview

Lists the applications that a user owns or has permission to manage.

## Example Response

`Content-Type: application/json`

```json
{
  "success": true,
  "applications": [
    {
      "id": "cltac3iem00027n2i3za015j5",
      "name": "Lens",
      "createdAt": "2024-03-02T17:05:11.090Z",
      "users": 12
    }
  ]
}
```

## Errors

### `401 Unauthorized`

The user is unauthenticated, or their session has expired.
