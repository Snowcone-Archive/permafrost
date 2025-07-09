# `DELETE /applications/:id/collaborators`

:::warning
🔒 This endpoint requires authorization.
:::

## Overview

Removes a collaborator to the specified application. The requesting user must own the application.

## Example Request

`Content-Type: application/json`

```json
{
  "collaborators": ["cltadkgjd0000pbltjrhd18eh"]
}
```

## Example Response

See [Get Application Example Response](/api/applications/get#example-responses)

## Errors

### `401 Unauthorized`

The user is unauthenticated, or their session has expired.

### `404 Not Found`

Either the application does not exist, or a requested user does not exist.

### `409 Conflict`

If a user being requested already existed, this status code will be returned.
