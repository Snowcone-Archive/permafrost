import * as z from "zod/v4";
import { Guards } from "../..";
import { randomAlphanumeric } from "../../utils/random";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/applications/:id/secret",
  method: "POST",
  schema: {
    path: z.object({
      id: z.string(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.applicationParam,
    Guards.collaborator({ allowAdmin: "admin" }),
    Guards.sudo,
  ],
  async exec({ path }, req, res, fastify) {
    const { prisma } = fastify;
    const { id } = path;
    const clientSecret = randomAlphanumeric("clientSecret");

    await prisma.application.update({
      where: {
        id,
      },
      data: {
        clientSecret,
      },
    });

    await req.auditLogEntry({
      affectedApplication: req.application!,
      action: "application-secret-reset",
      description: `@${req.user!.username} reset the client secret.`,
    });

    return res.status(200).send(
      req.user?.permissions.includes("Administrator") &&
        !req.user?.permissions.includes("SuperAdministrator")
        ? { success: true }
        : {
            clientSecret,
          }
    );
  },
});
