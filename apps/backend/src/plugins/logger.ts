import fp from "fastify-plugin";
import * as loggers from "../utils/logger";
import { success } from "../utils/logger";
import chalk from "chalk";

declare module "fastify" {
  interface FastifyInstance {
    logger: typeof loggers;
  }
}

const statusCodeColor = (statusCode: number) => {
  if (statusCode < 400) return chalk.green.bold;
  if (statusCode < 500) return chalk.yellow.bold;
  return chalk.red.bold;
};

const methodColor = (method: string) => {
  if (method === "GET") return chalk.blue.bold;
  if (method === "POST") return chalk.green.bold;
  if (method === "PUT") return chalk.yellow.bold;
  if (method === "PATCH") return chalk.cyan.bold;
  if (method === "DELETE") return chalk.red.bold;
  return chalk.gray.bold;
};

export const loggerPlugin = fp(async (fastify, options) => {
  fastify.decorate("logger", loggers);

  if (fastify.config().logRequests) {
    fastify.addHook("onSend", (req, res, payload, done) => {
      loggers.debug(
        `${statusCodeColor(res.statusCode)(res.statusCode)} ${methodColor(
          req.method
        )(req.method)} ${req.url} ${chalk.gray(
          `(${res.elapsedTime.toFixed(3)}ms)`
        )}`
      );

      done();
    });
  }

  success("Setup logger plugin!");
});
