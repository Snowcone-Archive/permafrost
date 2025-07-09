import staticServe from "@fastify/static";
import fastify from "fastify";
import fastifyFileUpload from "fastify-file-upload";
import { join as joinPath } from "path";
import * as z from "zod/v4";
import { applicationParamGuard } from "./guards/applicationParam";
import { authenticationGuard } from "./guards/authentication";
import { collaboratorGuardFactory } from "./guards/collaborator";
import { hasFlag, missingFlag } from "./guards/hasFlag";
import { hasPermission } from "./guards/hasPermission";
import { outOfBoxGuard } from "./guards/outOfBox";
import { ownsApplicationGuardFactory } from "./guards/ownsApplication";
import { sudoModeGuard } from "./guards/sudoMode";
import { auditLogPlugin } from "./plugins/auditLog";
import { configPlugin } from "./plugins/config";
import { formbodyPlugin } from "./plugins/formbody";
import { securityHeadersPlugin } from "./plugins/headers";
import { loggerPlugin } from "./plugins/logger";
import { mailPlugin } from "./plugins/mail";
import { metricsPlugin } from "./plugins/metrics";
import { prismaPlugin } from "./plugins/prisma";
import { rateLimitPlugin } from "./plugins/rateLimit";
import { statePlugin } from "./plugins/state";
import { storagePlugin } from "./plugins/storage";
import type { RouteSpecification } from "./types";
import { debug, error, info, success } from "./utils/logger";
import { makeArrayIfNeeded } from "./utils/misc";

const welcomeMessage = `
               ******         ******
               ********** **********
               *********************
               *********************
             ///*///*///*///*///**/***            Snowflake Permafrost
         /////////@@@@@@@//////////////////       https://id.snowflake.blue/
       ///////////@@@@@@@@@@@@@@@@//////////
         //////////@@@@@@//@@/*@*/////////%       Listening on port {{PORT}}
             /////////////////////////            Version {{VERSION}}
               /////////////////////
               /////////////////////
               ////////// //////////
               //////         %/////
`;

const app = fastify({
  trustProxy: ["127.0.0.1", "192.168.0.0/16", "10.0.0.1/24", "172.16.0.0/20"],
});

await app.register(staticServe, {
  root: joinPath(__dirname, "static"),
  prefix: "/static/",
});

await app.register(fastifyFileUpload);
await app.register(configPlugin);
await app.register(loggerPlugin);
await app.register(prismaPlugin);
await app.register(metricsPlugin);
await app.register(statePlugin);
await app.register(storagePlugin);
await app.register(auditLogPlugin);
await app.register(mailPlugin);
await app.register(formbodyPlugin);
await app.register(rateLimitPlugin);
await app.register(securityHeadersPlugin);

export const Guards = {
  authenticated: authenticationGuard,
  applicationParam: applicationParamGuard,
  hasPermission,
  collaborator: collaboratorGuardFactory,
  ownsApplication: ownsApplicationGuardFactory,
  sudo: sudoModeGuard,
  hasFlag: hasFlag,
  missingFlag: missingFlag,
  outOfBox: outOfBoxGuard,
};

app.setNotFoundHandler((req, res) => {
  res.status(404).send({
    error: {
      code: "NotFound",
      message: "The requested resource was not found.",
    },
  });
});

app.setErrorHandler((err, req, res) => {
  if (err.statusCode === 429) {
    res.statusCode = 429;
    return res.send({
      error: {
        code: "RateLimited",
        message: "You are being rate limited. Please try again later.",
      },
    });
  }

  app.metrics.errors
    .labels({
      path: req.routeOptions.url,
      method: req.method,
    })
    .inc(1);

  error(err);

  res.status(500).send({
    error: {
      code: "Internal",
      message: "Serious skill issue on the server. Please try again later.",
    },
  });
});

const glob = new Bun.Glob("**/*.ts");
for await (const file of glob.scan(joinPath(__dirname, "./routes"))) {
  try {
    const path = joinPath(__dirname, "./routes", file);
    const imported = await import(path);

    for (const routeSpecName in imported) {
      const routeSpec = imported[routeSpecName];
      const schemas = routeSpec.schema;
      const route = routeSpec as RouteSpecification<
        z.output<typeof schemas.body>,
        z.output<typeof schemas.path>,
        z.output<typeof schemas.query>
      >;

      if (!route.path) {
        continue;
      }

      makeArrayIfNeeded(route.path).forEach(async (path) => {
        app.route({
          url: path,
          method: route.method,
          config: {
            rateLimit: {
              max: route.rateLimit,
            },
          },
          ...(route.guards && {
            preParsing: route.guards,
          }),
          handler: async (req, res) => {
            let body,
              path,
              query = {};

            app.metrics.requests
              .labels({
                path: req.routeOptions.url,
                method: req.method,
              })
              .inc(1);

            if (route?.schema?.body) {
              const parsedBody = await route.schema.body.safeParseAsync(
                req.body
              );
              if (parsedBody.success) {
                body = parsedBody.data;
              } else {
                error(parsedBody.error);
                return res.status(400).send({
                  error: {
                    code: "IncorrectBody",
                    message: "The provided body was invalid.",
                  },
                });
              }
            }

            if (route?.schema?.path) {
              const parsedPath = await route.schema.path.safeParseAsync(
                req.params
              );
              if (parsedPath.success) {
                path = parsedPath.data;
              } else {
                return res.status(400).send({
                  error: {
                    code: "BadPathParams",
                    message: "The path parameters were invalid.",
                  },
                });
              }
            }

            if (route?.schema?.query) {
              const parsedQuery = await route.schema.query.safeParseAsync(
                req.query
              );
              if (parsedQuery.success) {
                query = parsedQuery.data;
              } else {
                return res.status(400).send({
                  error: {
                    code: "IncorrectQuery",
                    message: "The query parameters were invalid.",
                  },
                });
              }
            }

            const response = await route.exec(
              {
                body,
                path,
                query,
              },
              req,
              res,
              app
            );

            if (response && !res.sent) {
              res.status(200).send(response);
            }
          },
        });

        debug(`Registered route ${route.path}`);
      });
    }
  } catch (e) {
    error(`Error while registering route ${file}.ts`, e);
    process.exit(1);
  }
}

success("Registered all routes!");
app.ready(async () => {
  info(
    welcomeMessage
      .replaceAll("{{PORT}}", app!.config().port.toString())
      .replaceAll(
        "{{VERSION}}",
        (await import("./meta")).default.version.toString()
      )
  );
});

process.on("uncaughtException", (exception) => {
  error("Uncaught exception:", exception);
});

process.on("SIGINT", () => {
  success("Sigterm received, exiting.");
  process.exit();
});

await app.listen({
  port: app.config().port,
  host: "0.0.0.0",
  ipv6Only: false,
});

success(`Server started on port ${app.config().port}.`);
