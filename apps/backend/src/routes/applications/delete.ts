import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/applications/:id",
  method: "DELETE",
  schema: {
    path: z.object({
      id: z.string(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.applicationParam,
    Guards.ownsApplication({ allowAdmin: "admin" }),
    Guards.sudo,
  ],
  async exec(inputs, req, res, fastify) {
    const { prisma } = fastify;

    if (!req.application)
      return res.status(404).send({
        error: {
          code: "NotFound",
          resource: "Application",
          message: "This application has not been found.",
        },
      });

    await req.auditLogEntry({
      affectedApplication: {
        id: req.application.id,
        name: req.application.name,
      },
      action: "application-deleted",
      description: `@${req.user!.username} deleted this application.`,
    });

    await prisma.application.delete({
      where: {
        id: req.application.id,
      },
      include: {
        authorizations: true,
      },
    });

    return res.status(200).send({
      success: true,
    });
  },
});
