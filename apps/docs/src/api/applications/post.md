# `POST /applications`

:::warning
🔒 This endpoint requires authorization, and requires the CreateApplication permission.
:::

## Overview

Creates a new application,

## Example Body

`Content-Type: application/json`
All parameters, except `name`, are optional.

```json
{
  "name": "Awesomesauce Incorporated",
  "homepageURL": "https://awesomesauce.net",
  "termsOfServiceURL": "https://awesomesauce.net/tos",
  "privacyPolicyURL": "https://awesomesauce.net/privacy",
  "redirectURIs": [
    "https://awesomesauce.net/auth",
    "https://analytics.awesomesauce.net/auth"
  ],
  "collaborators": ["cltadkgjd0000pbltjrhd18eh", "cltadkgjd0000pbltjrhd18eh"]
}
```

## Example Responses

`Content-Type: application/json`

```json
{
  "id": "cltad27yi0000izg8lq8s1bcx",
  "name": "Awesomesauce Incorporated",
  "homepageURL": "https://snowflake.blue",
  "termsOfServiceURL": "https://snowflake.blue/tos",
  "privacyPolicyURL": "https://snowflake.blue/privacy",
  "owner": {
    "id": "cltac3fle00007n2iiys3arou",
    "username": "znepb",
    "displayName": "znepb",
    "createdAt": "2024-03-02T17:05:11.090Z"
  },
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
  "clientSecret": "taxtime!howmuch?justguess!uhhhh,$650?jail:("
}
```

## Errors

### `400 BadRequest`

The body was invalid.

### `401 Unauthorized`

The user is unauthenticated, or their session has expired.
