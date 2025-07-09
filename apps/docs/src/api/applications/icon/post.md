# `POST /applications/:id/icon`

:::warning
🔒 This endpoint requires authorization.
:::

## Overview

Changes the icon of an application.
This endpoint will take an image, any of the following mime types:

- image/png
- image/apng
- image/gif
- image/jpeg

## Errors

### `400 BadRequest`

- The file type was not allowed.

### `401 Unauthorized`

The user is unauthenticated, or their session has expired.
