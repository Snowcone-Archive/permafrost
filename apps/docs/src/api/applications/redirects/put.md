# `PUT /applications/:id/redirects`

:::warning
🔒 This endpoint requires authorization.
:::

## Overview

Adds a redirect URI to the specified application.

## Example Request

`Content-Type: application/json`

```json
{
  "redirectURIs": ["https://znepb.me", "https://snowflake.blue"]
}
```

## Example Response

See [Get Application Example Response](/api/applications/get#example-responses)

## Errors

### `401 Unauthorized`

The user is unauthenticated, or their session has expired.

### `409 Conflict`

If a redirect URL being requested already existed, this status code will be returned.
