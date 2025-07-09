# `PATCH /applications/:id`

:::warning
🔒 This endpoint requires authorization.
:::

## Overview

Updates the specified application.

## Example Request

`Content-Type: application/json`
All fields are optional. You could just use this as a complicated fetch request if you really wanted to.

```json
{
  "name": "Awesomesauce App, Second Edition",
  "homepageURL": "https://awesomersauce.com",
  "termsOfServiceURL": "https://awesomersauce.com/tos",
  "privacyPolicyURL": "https://awesomersauce.com/privacy"
}
```

## Example Response

See [Get Application Example Response](/api/applications/get#example-responses)

## Errors

### `400 Bad Request`

The request was bad.

### `401 Unauthorized`

The user is unauthenticated, they don't have access to modify this application, or their session has expired.

### `404 NotFound`

The requested application does not exist.
