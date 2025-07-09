# `GET /applications/:id`

:::warning
🔒 This endpoint requires authorization.
:::

## Overview

Gets the specified application ID.

## Example Responses

### General Unauthorized User

`Content-Type: application/json`

```json
{
  "id": "cltad27yi0000izg8lq8s1bcx",
  "name": "Snowflake Website",
  "homepageURL": "https://snowflake.blue",
  "termsOfServiceURL": "https://snowflake.blue/tos",
  "privacyPolicyURL": "https://snowflake.blue/privacy",
  "owner": {
    "id": "cltac3fle00007n2iiys3arou",
    "username": "znepb",
    "displayName": "znepb",
    "createdAt": "2024-03-02T17:05:11.090Z"
  },
  "createdAt": "2024-03-02T17:05:11.090Z",
  "redirectURIs": ["https://snowflake.blue/admin/auth"],
  "isAuthenticated": false,
  "users": 3
}
```

### Authorized Collaborator or Authorized Owner

`Content-Type: application/json`

```json
{
  "id": "cltad27yi0000izg8lq8s1bcx",
  "name": "Snowflake Website",
  "homepageURL": "https://snowflake.blue",
  "termsOfServiceURL": "https://snowflake.blue/tos",
  "privacyPolicyURL": "https://snowflake.blue/privacy",
  "owner": {
    "id": "cltac3fle00007n2iiys3arou",
    "username": "znepb",
    "displayName": "znepb",
    "createdAt": "2024-03-02T17:05:11.090Z"
  },
  // Collaborators and owners can view all collaborators on the project.
  "collaborators": [
    {
      "id": "cltadkgjd0000pbltjrhd18eh",
      "username": "autione",
      "displayName": "AutiOne",
      "createdAt": "2024-03-02T17:05:11.090Z"
    },
    {
      "id": "cltalnu790000w38k0ipjx8fm",
      "username": "piprett",
      "displayName": "Piprett",
      "createdAt": "2024-03-02T17:05:11.090Z"
    }
  ],
  "createdAt": "2024-03-02T17:05:11.090Z",
  "redirectURIs": ["https://snowflake.blue/admin/auth"],
  // This will say "owner" if the requesting user is the owner.
  "role": "collaborator",
  "isAuthenticated": true,
  "users": 3
}
```

## Errors

### `401 Unauthorized`

The user is unauthenticated, or their session has expired.

### `404 NotFound`

The requested application does not exist.
