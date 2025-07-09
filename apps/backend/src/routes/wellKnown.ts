import { join } from "node:path";
import { applicationsJwkData } from "../utils/auth";
import { SupportedScopes } from "../utils/consts";
import { route } from "../utils/routeBuilder";

export const openidDiscovery = route({
  path: [
    "/.well-known/openid-configuration",
    "/.well-known/openid-configuration.json",
  ],
  method: "GET",
  schema: {},
  guards: [],
  async exec({ body }, req, res, fastify) {
    return {
      issuer: fastify.config().backendUrl,
      authorization_endpoint: `${fastify.config().frontendUrl}/authorize`,
      token_endpoint: `${fastify.config().backendUrl}/oauth/token`,
      userinfo_endpoint: `${fastify.config().backendUrl}/oauth/userinfo`,
      jwks_uri: `${fastify.config().backendUrl}/.well-known/jwks`,
      scopes_supported: SupportedScopes,
      response_types_supported: ["code"],
    };
  },
});

export const jwks = route({
  path: ["/.well-known/jwks", "/.well-known/jwks.json"],
  method: "GET",
  schema: {},
  guards: [],
  async exec({ body }, req, res, fastify) {
    return {
      keys: [
        {
          alg: "RS256",
          kid: "rs256",
          use: "sig",
          kty: applicationsJwkData.kty,
          n: applicationsJwkData.n,
          e: applicationsJwkData.e,
        },
      ],
    };
  },
});

export const securityPolicy = route({
  path: ["/.well-known/security.txt"],
  method: "GET",
  async exec({ body }, req, res, fastify) {
    res.header("Content-Type", "text/plain");

    const pageFile = Bun.file(join(__dirname, "../templates/security.txt"));
    const pageData = await pageFile.text();

    res.send(pageData);
  },
});
