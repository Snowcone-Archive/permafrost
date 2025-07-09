import * as z from "zod/v4";
import { hashPassword } from "../../utils/auth";
import { route } from "../../utils/routeBuilder";

type ResetData = {
  timestamp: number | null;
  token: string;
};

export default route({
  path: "/users/:id/reset",
  method: "PUT",
  schema: {
    body: z.object({
      password: z.string().min(4).max(64),
    }),
    path: z.object({
      id: z.string(),
    }),
  },
  async exec({ path, body }, req, res, fastify) {
    const { prisma } = fastify;

    if (!req.headers.authorization)
      return res.status(401).send({
        error: {
          code: "Unauthorized",
          message: "Authorization is needed to get the requesting user.",
        },
      });

    const user = await prisma.user.findFirst({ where: { id: path.id } });
    if (!user)
      return res.status(404).send({
        error: {
          code: "NotFound",
          resource: "User",
          message: "This user has no pending password resets.",
        },
      });

    if (user.flags.includes("RequiresEmailVerification")) {
      return res.status(403).send({
        error: {
          code: "Forbidden",
          message:
            "A verified email must exist on the account before a password reset can be requested. Please contact an administrator to reset your password.",
        },
      });
    }

    let resetData = user.resetData as ResetData | undefined;

    if (
      resetData?.timestamp &&
      resetData.timestamp + 15 * 60 * 1000 < Date.now()
    ) {
      resetData = undefined;
      await prisma.user.update({
        where: { id: user.id },
        data: { resetData: undefined },
      });
    }

    if (!resetData)
      return res.status(404).send({
        error: {
          code: "NotFound",
          resource: "User",
          message: "This user has no pending password resets.",
        },
      });

    if (
      req.headers.authorization.replace("Bearer", "").trim() !== resetData.token
    )
      return res.status(401).send({
        error: {
          code: "NotAllowed",
          message: "Reset tokens do not match.",
        },
      });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetData: undefined,
        password: await hashPassword(body.password + fastify.config().pepper),
        passwordPepper: true,
        sessions: { deleteMany: { userId: user.id } },
        flags: user.flags.filter((f) => f !== "RequiresPasswordChange"),
      },
    });

    await req.auditLogEntry({
      executingUser: user,
      affectedUser: user,
      action: "password-reset-email",
      description: `User @${user.username} reset their password via an E-Mail reset link.`,
    });

    return res.status(200).send({
      success: true,
    });
  },
});
