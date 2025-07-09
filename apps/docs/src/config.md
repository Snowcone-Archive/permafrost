# Configuring Permafrost

Permafrost can be configured via a TypeScript file (on non-Docker or
development) or via an environment variables (useful for Docker compose).

## Via config.ts

TypeScript configuration files support typing, making configuration easier. This
method is recommended for deploying locally not on Docker, or while developing
Permafrost. For an example `config.ts` file, see
[config.example.ts](https://github.com/Snowcone-Labs/permafrost-id/blob/main/config.example.ts)
in git permafrost-id repo.

### Configuration keys

- pepper: `string`, the secret password pepper to use. A small (max 32 chars)
  random string. **Do not change this after setting it, passwords will stop working**
- databaseURL: `string`, the connection URL of your Postgres database.
- port: `number`, the port to connect to, default is 1234
- frontendURL: `string`, the URL that hosts the frontend, default is `http://localhost:3000`
- githubClientID: `string`, optional, the client ID for the Github OAUth sign-in method.
- githubClientSecret: `string`, optional, the secret for the Github OAuth app.
- githubOrgId: `string`, optional, the organization ID to filter by when signing
  up for Permafrost. This does not affect sign-ins, only sign ups. If excluded,
  anybody will be able to make an account on Permafrost as long as they have a
  Github account.
- discordClientID: `string`, optional, the client ID for the Discord OAuth
  sign-in method.
- discordClientSecret: `string`, optional, the secret for the Github OAuth app.
- discordGuildId: `string`, optional, the guild ID to filter by when signing up
  for Permafrost. This does not affect sign-ins, only sign ups. If excluded,
  anybody will be able to make an account on Permafrost as long as they have a
  Discord account.

## Via environment variables

Environment variables are best used when deploying on Docker or Docker Compose.

### Using exclusively environment variables

If using exclusively environment variables, Permafrost will throw a warning to
the logs on every startup. This can be suppressed by adding
`PF_SUPPRESS_CONFIG_WARNING` to your environment variable list. The value of
this variable does not matter, it will be realized as long as the key is
present.

### Configuration key capitalisation

> [!IMPORTANT]
> All environment variables must be prefixed by `PF_`

It uses the same configuration keys as `config.ts`, but `UPPER_SNAKE_CASE`
instead of `lowerCamelCase`. For example, `githubClientId` would instead be
`PF_GITHUB_CLIENT_ID` when using environment variables.
