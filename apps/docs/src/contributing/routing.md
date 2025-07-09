# Backend Routing and Guards

Permafrost uses a custom system for registering routes, powered by fastify.
If you are creating a new route in VSCode you can use the `newRoute` snippet as a template.
You can also copy-paste the following:

```ts
import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/greeting",
  method: "POST",
  schema: {
    body: z.object({
      name: z.string(),
    }),
  },
  guards: [Guards.authenticated],
  async exec({ body }, req, res, fastify) {
    const { prisma } = fastify;

    return {
      message: `Hello, ${body.name}`,
    };
  },
});
```

## Guards

Guards are like middleware! They do shit before the main route handler gets to do it's thing. We use fastify hooks in our implementation.

### Authentication

The authentication guard makes sure you have logged in, and no application is acting on your behalf.
`user` and `session` objects are added the the request object.

```ts
guards: [Guards.authenticated];
```

### Application Parameters

Parses a `:id` path parameter, finds the application in the database, and attaches it to `req.application`.

```ts
guards: [Guards.applicationParam];
```

### Has Permission

Checks if the user has a permission.

:::warning
The guard is a bit special! It that requires you to call it instead of reference it,
and in the argument you put the permission node to check.
:::

**Requires:**

- [Authentication Guard](#authentication)

```ts
guards: [Guards.authenticated, Guards.hasPermission("Administrator")];
```

### Owns Application

Checks if the user owns the application parsed in the [Application Parameters Guard](#application-parameters).

**Requires:**

- [Authentication Guard](#authentication)
- [Application Parameters Guard](#application-parameters)

```ts
guards: [Guards.authenticated, Guards.applicationParam, Guards.ownsApplication];
```

### Collaborates on application

Checks if the user owns, or collaborates on, the application parsed in the [Application Parameters Guard](#application-parameters).

**Requires:**

- [Authentication Guard](#authentication)
- [Application Parameters Guard](#application-parameters)

```ts
guards: [Guards.authenticated, Guards.applicationParam, Guards.collaborator];
```

## Rate limit

Rate limits are important to keep out bad actors, as they make bruteforcing much less plausible.
Permafrost's rate limiting uses [`@fastify/rate-limit`](https://github.com/fastify/fastify-rate-limit) under the hood.
The configuration for the rate limiting can be found in [`/apps/backend/src/plugins/rateLimit.ts`](https://github.com/Snowcone-Labs/permafrost/blob/main/apps/backend/src/plugins/rateLimit.ts).
Permafrost indexes based on the user account if one is signed in, otherwise it uses the IP address.

We impose a rate limit as follows for every route:

| Authentication Type  | Global rate limit |
| -------------------- | ----------------- |
| Admin                | 600 req/min       |
| User and new account | 300 req/min       |
| Unauthenticated      | 30 req/min        |

Additionaly, the sign-in routes may have a lower rate limit.

If certain criteria are met, you are able to bypass rate limiting:

1. The `NODE_ENV` environment variable is set to `development`
2. The request IP address is a local IP address. Keep in mind that a reverse proxy may inject headers to change the IP parsed.
