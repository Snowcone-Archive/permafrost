import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/users/:userId/reactivate",
  method: "POST",
  schema: {
    path: z.object({
      userId: z.cuid2(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.hasPermission("Administrator"),
    Guards.sudo,
  ],
  async exec({ body, path }, req, res, fastify) {
    const { prisma } = fastify;

    const user = await prisma.user.findFirst({
      where: {
        id: path.userId,
      },
    });

    if (!user) {
      return res.status(404).send({
        error: {
          code: "NotFound",
          message: "User not found",
        },
      });
    }

    await prisma.user.update({
      where: {
        id: path.userId,
      },
      data: {
        flags: {
          set: user.flags.filter((flag) => flag !== "Disabled"),
        },
      },
    });

    req.auditLogEntry({
      action: "reactivate-user",
      affectedUser: user,
      description: "User account reactivated",
    });

    return res.status(200).send({
      success: true,
    });
  },
});
