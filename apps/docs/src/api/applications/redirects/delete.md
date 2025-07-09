# `DELETE /applications/:id/redirects`

:::warning
🔒 This endpoint requires authorization.
:::

## Overview

Removes the specified redirect URIs from the specified application.

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

### `400 BadRequest/InvalidRedirectURI`

One of two reasons:

- You have attempted to remove the last remaining redirect URL
- One of the requested redirect URLs does not exist

### `401 Unauthorized`

The user is unauthenticated, or their session has expired.
