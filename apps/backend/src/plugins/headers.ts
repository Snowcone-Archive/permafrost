import corsPlugin from "@fastify/cors";
import fp from "fastify-plugin";
import { success } from "../utils/logger";

export const securityHeadersPlugin = fp(async (fastify, options) => {
  fastify.addHook("onSend", (req, res, payload, next) => {
    res.header("X-Frame-Options", "DENY");
    next();
  });

  await fastify.register(corsPlugin, {
    origin: fastify.config().frontendUrl,
    maxAge: 24 * 60 * 60, // Caches cors configuration for 24 hours, preventing pre-flight
  });

  success("Setup security headesr plugin!");
});
