import { parse as contentParser } from "fast-querystring";
import fp from "fastify-plugin";
import * as loggers from "../utils/logger";
import { success } from "../utils/logger";

declare module "fastify" {
  interface FastifyInstance {
    logger: typeof loggers;
  }
}

export const formbodyPlugin = fp(async (fastify, options) => {
  fastify.addContentTypeParser(
    "application/x-www-form-urlencoded",
    { parseAs: "buffer" },
    (req, payload, done) => {
      try {
        const parsed = contentParser(payload.toString());
        done(null, parsed);
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );

  success("Setup formbody plugin!");
});
