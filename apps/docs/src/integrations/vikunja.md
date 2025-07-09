# Vikunja Integration

> The open-source, self-hostable to-do app
>
> &mdash; <cite>Vikunja.io</cite>

**Last tested:** 26th March 2024

Vikunja supports OpenID Connect authentication with OpenID Connect Discovery.

## Vikunja Installation

Please follow [one of the installation guides](https://vikunja.io/docs/installing/) on vikunja's website.
To quickly test out the permafrost integration, you can use the following docker command:

```shell
docker run --rm -v $PWD/config.yml:/etc/vikunja/config.yml --network host vikunja/vikunja
```

## Permafrost Setup

1. Login to Permafrost and create an application for vikunja.
2. Copy and save the client ID and client secret for later.
3. Add a redirect URI for vikunja: `https://vikunja.example.com/auth/openid/permafrost`

## Vikunja Setup

In your vikunja configuration file, add the following code replacing as neccessarry:

```yml
auth:
  openid:
    enabled: true
    redirecturl: https://vikunja.example.com/auth/openid/
    providers:
      - name: Permafrost
        authurl: https://permafrost.example.com
        clientid: The client ID you noted down
        clientsecret: The client secret you noted down
        scope: profile email
  local:
    enabled: false
```
