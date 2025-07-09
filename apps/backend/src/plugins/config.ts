import fp from "fastify-plugin";
import { ConfigManager, type ConfigShapeType } from "../config";
import { success } from "../utils/logger";

declare module "fastify" {
  interface FastifyInstance {
    config: () => ConfigShapeType;
    configManager: ConfigManager;
  }
}

export const configPlugin = fp(async (fastify, options) => {
  const manager = new ConfigManager();
  await manager.init();
  fastify.decorate("config", () => manager.config);
  fastify.decorate("configManager", manager);
  success("Loaded configuration!");
});
