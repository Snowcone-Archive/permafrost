# Portainer Integration

> Irrespective of your industry, orchestration platform, or computing device,
> Portainer is the most versatile container management software that
> simplifies your secure adoption of containers with remarkable speed.
>
> &mdash; <cite>Portainer.io</cite>

**Last tested**: 27th March 2024

Portainer supports OpenID Connect without discovery.

## Portainer Installation

Please follow [their installation guide](https://docs.portainer.io/start/install-ce/server/docker/linux).
To quickly test out the permafrost integration, you can use the following docker command:

```shell
docker run --rm --network host -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer-ce:latest
```

Portainer will be available on port 9000.

## Permafrost Setup

1. Login to Permafrost and create an application for Portainer
2. Copy and save the client ID and client secret for later
3. Add a redirect URI for Portainer: `https://portainer.example.com/`

## Portainer setup

1. Log into your Portainer account and click the "Settings" button on the sidebar
2. Click on "Authentication"
3. Click on "OAuth"
4. Enable "Automatic user provisioning"
5. Fill in the "OAuth Configuration" fields as follows:
   1. Client id and client secret as noted down in the permafrost setup
   2. "Authorization URL" to `https://frontend.example.com/authorize`
   3. "Access token URL" to `https://auth.example.com/oauth/token`
   4. "Resource URL" to `https://auth.example.com/oauth/userinfo`
   5. "Redirect URL" to `https://portainer.example.com/`
   6. "User identifier" to `preferred_username`
   7. "Scopes" to `profile email`
6. Save
