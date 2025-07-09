# `POST /users/auth`

:::info
This endpoint is intended to be an internal endpoint only. End users should use applications.
:::

## Overview

Authorizes a user based on their e-mail, password, and two-factor authentication token, if they have two-factor authentication enabled.

## Example Request

`Content-Type: application/json`

```json
{
  "email": "znepb@snowflake.blue",
  "password": "GoBlue!2023",
  "otp": "690420"
}
```

## Example Response

### Success

```json
{
  "user": {
    "id": "cltac3fle00007n2iiys3arou",
    "username": "znepb",
    "displayName": "Marcus",
    "email": "znepb@snowflake.blue",
    "flags": [],
    "permissions": ["Admin"],
    "createdAt": "2024-03-02T17:05:11.090Z",
    "twoFactorEnabled": true
  },
  "session": {
    "id": "cltac3iem00027n2i3za015j5",
    "token": "very long safe string :D",
    "lastActivity": "2024-03-02T17:05:14.734Z"
  }
}
```

## Errors

### `404 NotFound`

No user exists matching the credentials provided.

---

### `428 PreconditionRequired`

- Field: `password`
  - The account is required to change their password before logging in.
- Field: `otp`
  - A two-factor authentication token is required.

---

### `403 InvalidField`

- Field: `otp`
  - The provided 2FA code is invalid.
