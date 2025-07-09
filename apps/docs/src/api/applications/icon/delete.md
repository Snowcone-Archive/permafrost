# `DELETE /applications/:id/icon`

:::warning
🔒 This endpoint requires authorization.
:::

## Overview

Deletes the current icon and sets it to the default. That's about it.

## Errors

### `400 BadRequest`

- The file type was not allowed.

### `401 Unauthorized`

The user is unauthenticated, or their session has expired.
