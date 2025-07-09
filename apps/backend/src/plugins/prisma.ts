import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";
import { success } from "../utils/logger";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export const prismaPlugin = fp(async (fastify, options) => {
  const prisma = new PrismaClient({
    datasourceUrl: fastify.config().databaseUrl,
  });
  await prisma.$connect();
  success("Connected to database!");

  fastify.decorate("prisma", prisma);
  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
