# Discord Social Login

Discord is a popular communication platform, and can be integrated with Permafrost.

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to oAuth
4. Note down your client ID and client secret
5. Add the redirect URI `https://auth.example.com/oauth/verify/discord`, replaced with your domain.
6. Put your client ID and secret into the configuration

![Discord Developer Portal: Create an Application](/assets/discord/stage1.png)
![Discord Developer Portal: oAuth](/assets/discord/stage2.png)
