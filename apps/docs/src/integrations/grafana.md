# Grafana

> Query, visualize, alert on, and understand your data no matter where it’s stored.
> With Grafana you can create, explore, and share all of your data through beautiful, flexible dashboards.
>
> &mdash; <cite>Grafana.com</cite>

**Last tested**: 9th August 2024

Grafana supports generic OAuth integration.

## Permafrost Setup

1. Login to Permafrost and create an application for Grafana.
2. Copy and save the client id and client secret for later.
3. Add redirect URI: `https://[your grafana url]/login/generic_oauth`

## Grafana Setup

1. Open up Grafana in your web browser of choice
2. Navigate to Administration --> Authentication
3. Select "Generic OAuth"
4. Set "Display name" to `Permafrost`
5. Set "Client Id" to the client id you copied earlier
6. Set "Client secret" to the client secret you copied earlier
7. Set "Auth style" to `InParams`
8. In "Scopes" add `openid`, `profile` and `email`
9. Set "Auth URL" to `https://[your permafrost frontend url]/authorize`
10. Set "Token URL" to `https://[your permafrost backend url]/oauth/token`
11. Set "API URL" to `https://[your permafrost backend url]/oauth/userinfo`
12. If you wish new users to be able to sign up, enable "Allow sign up"
13. Open up the "User Mapping" dropdown
14. Enable the "Skip organization role sync" switch
15. Set "Email attribute name" to nothing
16. Set "Email attribute path" to `email`
17. Set "Login attribute path" to `userId`
18. If you are running for development purpuses, without SSL, enable "TLS skip verify" under "Extra security measures"

:::warning IMPORTANT
Make sure to set the `GF_AUTH_OAUTH_ALLOW_INSECURE_EMAIL_LOOKUP` to `true`.
This is due to an issue in Grafana, and is out of our control.
Read more at [grafana/grafana#70203](https://github.com/grafana/grafana/issues/70203).
:::

More information can be found [at the Grafana documentation](https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/generic-oauth/).

## Testing the integration

For testing this integration, without a real Grafana setup, you can use the following Docker command.

:::warning
Do not use this command in production! Your data will be erased
:::

```bash
docker run --rm -d --name=grafana -e "GF_SERVER_ROOT_URL=http://localhost:3005/" -e "GF_SERVER_HTTP_PORT=3005" -e "GF_AUTH_OAUTH_ALLOW_INSECURE_EMAIL_LOOKUP=true" --network host grafana/grafana
```
