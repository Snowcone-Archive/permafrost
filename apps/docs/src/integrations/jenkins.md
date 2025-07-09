# Memos integration

> The leading open source automation server,
> Jenkins provides hundreds of plugins to support building, deploying and automating any project.
>
> &mdash; <cite>Jenkins.io</cite>

:::warning
The jenkins integration is work in progress, and does not work.
Setting this up will result in being unable to log into jenkins!
:::

**Last tested**: 27th March 2024

Jenkins supports OpenID Connect with discovery through a third-party plugin.

## Jenkins Installation

Please follow [their installation guide](https://www.jenkins.io/doc/book/installing/docker/).
To quickly test out the permafrost integration, you can use the following docker command:

```shell
docker run --restart always --network host jenkins/jenkins:lts-jdk17
```

Jenkins will start on port 8080, and you need to input the key displayed in the console.
In the installation wizard you pretty much don't need any of the plugins.

## Permafrost Setup

1. Login to Permafrost and create an application for Jenkins
2. Copy and save the client ID and client secret for later
3. Add a redirect URI for Jenkins: `https://jenkins.example.com/securityRealm/finishLogin`

## Jenkins setup

1. From the home page, click on "Manage Jenkins" on the sidebar
2. Click on "Plugins"
3. On the new sidebar click on "Available plugins"
4. Search for "OpenId Connect Authentication"
5. Install the plugin
6. Restart Jenkins. This can easily be done by clicking the checkbox on the bottom of the page
7. Log back in, and navigate back to "Manage Jenkins"
8. Go to "Security"
9. On "Security Realm", switch to "Login with OpenId Connect"
10. Set the client id and secret to what you got in the permafrost setup
11. Enable "Automatic configuration" with the endpoint as `https://auth.example.com/.well-known/openid-configuration`
12. Enable "Override scopes" and set it to `profile email`
13. Expand the "Advanced" section and update as follows:
    1. "User name field name" to `preferred_username`
    2. "Full name" to `name`
    3. "Email field name" to `email`
14. Press save
15. It doesn't work
