import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/users/:userId/disable",
  method: "POST",
  schema: {
    path: z.object({
      userId: z.cuid2(),
    }),
    body: z.object({
      message: z.string().optional(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.hasPermission("Administrator"),
    Guards.sudo,
  ],
  async exec({ body, path }, req, res, fastify) {
    const { prisma } = fastify;

    const user = await prisma.user.update({
      where: {
        id: path.userId,
      },
      data: {
        flags: {
          push: "Disabled",
        },
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

    fastify.mail.sendMail({
      user,
      subject: "Your account has been disabled",
      type: "disabled",
      replacements: {
        displayname: user.displayName || user.username,
        message:
          body.message == "" || body.message == null
            ? `<p>The administrator who deactivated your account chose not to leave a reasoning.</p>`
            : `<p>The administrator who disabled your account left this reasoning:</p><p>${body.message}</p>`,
      },
    });

    req.auditLogEntry({
      action: "disable-user",
      affectedUser: user,
      description: "User account disabled",
    });

    return res.status(200).send({
      success: true,
    });
  },
});
