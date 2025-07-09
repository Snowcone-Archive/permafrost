# Mealie Integration

> A self-hosted recipe manager and meal planner with a RestAPI backend and a reactive frontend application
> built in Vue for a pleasant user experience for the whole family.
>
> &mdash; <cite>Mealie.io</cite>

**Last tested:** 31th March 2024

:::warning
Mealie's OIDC support is in beta, and does not currently work.
:::

Mealie supports OpenID Connect authentication with discovery.

## Mealie Installation

Please follow [one of the installation guides](https://Mealie.io/docs/installing/) on Mealie's website.
To quickly test out the permafrost integration, you can use the following docker command:

```shell
docker run --rm --network host --env-file ./mealie.env ghcr.io/mealie-recipes/mealie:nightly
```

## Permafrost Setup

1. Login to Permafrost and create an application for Mealie.
2. Copy and save the client ID and client secret for later.
3. Add a redirect URI for Mealie: `http://localhost:9000/login`

## Mealie Setup

In your `mealie.env` file paste the following, and replace as needed:

```toml
ALLOW_SIGNUP=true
PUID=1000
PGID=1000
MAX_WORKERS=1
WEB_CONCURRENCY=1
BASE_URL=http://localhost:9000
OIDC_AUTH_ENABLED=true
OIDC_SIGNUP_ENABLED=true
OIDC_CONFIGURATION_URL=http://localhost:1234/.well-known/openid-configuration
OIDC_CLIENT_ID=client id
OIDC_CLIENT_SECRET=client secret
OIDC_AUTO_REDIRECT=true
OIDC_PROVIDER_NAME=Permafrost
OIDC_REMEMBER_ME=true
```
