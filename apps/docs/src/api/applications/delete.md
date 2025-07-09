# `GET /applications/:id`

:::warning
🔒 This endpoint requires authorization.
:::

## Overview

Deletes the specified application.

## Example Responses

`Content-Type: application/json`

```json
{
  "success": true
}
```

## Errors

### `401 Unauthorized`

The user is unauthenticated, or their session has expired.

### `404 NotFound`

The requested application does not exist.
