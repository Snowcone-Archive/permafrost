import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/users/:userId",
  method: "DELETE",
  schema: {
    path: z.object({
      userId: z.cuid2(),
    }),
    body: z.object({
      message: z.string().optional(),
    }),
  },
  guards: [Guards.authenticated, Guards.sudo],
  async exec({ body, path }, req, res, fastify) {
    const { prisma } = fastify;

    const userId = path.userId === "me" ? req.user!.id : path.userId;

    if (
      userId !== req.user!.id &&
      !req.user!.permissions.includes("SuperAdministrator")
    ) {
      return res.status(403).send({
        error: {
          code: "Forbidden",
          message: "You do not have permission to delete this user.",
        },
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
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
      subject: "Your account has been deleted",
      type: "deleted",
      replacements: {
        username: user.username,
        message:
          body.message === undefined || body.message == ""
            ? `<p>The administrator who deleted your account chose not to leave a reasoning.</p>`
            : `<p>The administrator who deleted your account left this reasoning:</p><p>${body.message}</p>`,
      },
    });

    req.auditLogEntry({
      action: "disable-user",
      affectedUser: user,
      description: `User account deleted by administrator.`,
    });

    await prisma.oAuthSignInData.deleteMany({
      where: {
        userId,
      },
    });

    await prisma.session.deleteMany({
      where: {
        userId,
      },
    });

    await prisma.tokenRequestCode.deleteMany({
      where: {
        authorization: {
          userId,
        },
      },
    });

    await prisma.authorization.deleteMany({
      where: {
        userId,
      },
    });

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return res.status(200).send({
      success: true,
    });
  },
});
