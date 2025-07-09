# Memos integration

> A privacy-first, lightweight note-taking service
>
> &mdash; <cite>usememos.com</cite>

**Last tested**: 27th March 2024

Memos supports OpenID Connect without discovery.

## Memos Installation

Please follow [their installation guide](https://www.usememos.com/docs/install/self-hosting).
To quickly test out the permafrost integration, you can use the following docker command:

```shell
docker run --rm --network host neosmemo/memos:stable
```

Memos will start on port 5230.

## Permafrost Setup

1. Login to Permafrost and create an application for Memos
2. Copy and save the client ID and client secret for later
3. Add a redirect URI for Memos: `https://memos.example.com/auth/callback`

## Memos setup

1. Log into your Memos account and click the "Settings" button on the sidebar
2. Click on "SSO"
3. Click "Create"
4. Make sure the type is "OAuth2" and the template is "Custom"
5. Fill out the following details
   1. Set "Name" to "Permafrost"
   2. Set "Client ID" to the client ID you got in the permafrost setup
   3. Set "Client secret" to the client secret you got in the permafrost setup
   4. Set the "Authorization endpoint" to `https://frontend.example.com/authorize`
   5. Set the "Token endpoint" to `https://auth.example.cm/oauth/token`
   6. Set the "User endpoint" to `https://auth.example.com/oauth/userinfo`
   7. Set "Scopes" to `profile email`
   8. Set "Identifier" to `preferred_username`
   9. Optionally set "Display Name" to `name`
   10. Optionally set "Email" to `email`
