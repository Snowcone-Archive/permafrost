import * as z from "zod/v4";
import { randomAlphanumeric } from "../../utils/random";
import { route } from "../../utils/routeBuilder";
import { emailSchema } from "../../utils/validation";

type ResetData = {
  timestamp: number | null;
  token: string;
};

export default route({
  path: "/users/:id/reset",
  method: "POST",
  schema: {
    body: z.object({
      email: emailSchema,
    }),
  },
  rateLimit: 3,
  async exec({ body }, req, res, fastify) {
    const { prisma, mail, config } = fastify;

    const user = await prisma.user.findFirst({
      where: { email: body.email },
    });
    if (user) {
      const result = await prisma.user.update({
        where: { id: user.id },
        data: {
          resetData: {
            timestamp: Date.now(),
            token: randomAlphanumeric("passwordReset"),
          },
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

      const resetData = result.resetData as ResetData;
      const url = `${config().frontendUrl}/auth/reset?userId=${user.id}&token=${
        resetData.token
      }`;

      await req.auditLogEntry({
        affectedUser: user,
        executingUser: user,
        action: "password-reset-requested",
        description: `Someone requested a password reset for @${result.username}.`,
      });

      await mail.sendMail({
        user,
        subject: "Permafrost Password Reset",
        type: "password-reset",
        replacements: {
          displayname: user.displayName || user.username,
          resetLink: url,
        },
      });
    }

    return {
      success: true,
    };
  },
});
