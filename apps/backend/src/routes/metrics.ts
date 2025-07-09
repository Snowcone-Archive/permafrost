import meta from "../meta";
import { route } from "../utils/routeBuilder";

export const getMeta = route({
  path: "/metrics",
  method: "GET",
  async exec(inputs, req, res, fastify) {
    res.send(
      (await fastify.registry.metrics()) +
        `\n${(await fastify.prisma.$metrics.prometheus()).replaceAll(
          "prisma_",
          "permafrost_prisma_"
        )}`
    );
  },
});
