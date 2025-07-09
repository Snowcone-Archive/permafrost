# OpenID Connect Integration

Permafrost supports the [OpenID Connect standard](https://openid.net/specs/openid-connect-core-1_0.html) (OIDC for short).
OIDC is also sometimes reffered to as oAuth.

## OpenID Connect Discovery

Permafrost also exposes an OpenID Connect Discovery endpoint at `/.well-known/openid-configuration`.
In most applications that support OIDC Discovery, you only enter the base URL, which would be `https://auth.example.com`.

## URLs

While it is recommended to find the various URLs and paths at the discovery endpoint, here are the usual paths:

| Name          | Path                                        |
| ------------- | ------------------------------------------- |
| Authorization | `https://frontend.example.com/authorize`    |
| Token         | `https://auth.example.com/oauth/token`      |
| Userinfo      | `https://auth.example.com/oauth/userinfo`   |
| JWKs          | `https://auth.example.com/.well-known/jwks` |

## Scopes

Permafrost currently only supports two scopes:

- profile
- email
- openid (ignored)
