# `GET /applications/:id/icon`

## Overview

Gets an application's icon.
This endpoint will return an image, any of the following mime types:

- image/png
- image/apng
- image/gif
- image/jpeg

## Errors

### `404 NotFound`

- Resource: `Application`
  - The application does not exist.
