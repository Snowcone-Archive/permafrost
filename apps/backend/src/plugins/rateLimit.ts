import fastifyRateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";
import ipaddrJs from "ipaddr.js";
import { success } from "../utils/logger";

export const rateLimitPlugin = fp(async (fastify, options) => {
  await fastify.register(fastifyRateLimit, {
    max: async (request, key) => {
      if (
        request.user?.permissions.includes("Administrator") ||
        request.user?.permissions.includes("SuperAdministrator")
      )
        return 600;

      if (request.user) return 300;
      return 30;
    },
    timeWindow: "60s",
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
    allowList: async (req, key) => {
      return (
        process.env.NODE_ENV === "development" &&
        ipaddrJs.parse(req.ip).range() === "private"
      );
    },
  });

  success("Initialized rate limit plugin!");
});
