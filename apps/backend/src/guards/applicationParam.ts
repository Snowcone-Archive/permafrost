import { Prisma } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";
import * as z from "zod/v4";

declare module "fastify" {
  interface FastifyRequest {
    application?: Prisma.ApplicationGetPayload<{
      include: {
        collaborators: true;
      };
    }>;
  }
}

export async function applicationParamGuard(
  req: FastifyRequest,
  res: FastifyReply
) {
  const params = await z
    .object({
      id: z.string(),
    })
    .safeParseAsync(req.params);

  if (!params.success)
    return res.status(400).send({
      error: {
        code: "BadRequest",
        resource: "Application",
        message: "Missing application ID in path.",
      },
    });

  const application = await req.server.prisma.application.findFirst({
    where: {
      id: params.data.id,
    },
    include: {
      collaborators: true,
    },
  });

  if (!application)
    return res.status(404).send({
      error: {
        code: "NotFound",
        resource: "Application",
        message: "This application has not been found.",
      },
    });

  req.application = application;
}
