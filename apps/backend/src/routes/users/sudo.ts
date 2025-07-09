import { DateTime } from "luxon";
import * as z from "zod/v4";
import { Guards } from "../..";
import { verifyPassword } from "../../utils/auth";
import { processTotp } from "../../utils/crypto/totp";
import { route } from "../../utils/routeBuilder";
import { otpSchema } from "../../utils/validation";

export default route({
  path: "/users/sudo",
  method: "POST",
  schema: {
    body: z.object({
      password: z.string().optional(),
      otp: otpSchema.optional(),
      backupCode: z.string().optional(),
    }),
  },
  guards: [Guards.authenticated],
  async exec({ body }, req, res, fastify) {
    const { prisma } = fastify;
    const { user } = req;

    if (body.otp || body.backupCode) {
      if (body.backupCode) {
        if (!user?.twoFactorBackupCodes.includes(body.backupCode)) {
          return res.status(403).send({
            error: {
              code: "Unauthorized",
              field: "backupCode",
            },
          });
        }

        // Remove backup code (can't be reused)
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            twoFactorBackupCodes: {
              set: user.twoFactorBackupCodes.filter(
                (v) => v !== body.backupCode
              ),
            },
          },
        });
      } else if (
        body.otp &&
        !(await processTotp({ prisma, user: user!, token: body.otp }))
      )
        return res.status(403).send({
          error: {
            code: "InvalidField",
            field: "otp",
            message: "This two-factor authentication code is invalid.",
          },
        });
    } else if (
      body.password &&
      (await verifyPassword(
        user!.password,
        user?.passwordPepper
          ? body.password + fastify.config().pepper
          : body.password
      )) == false
    ) {
      return res.status(403).send({
        error: {
          code: "Unauthorized",
          field: "password",
        },
      });
    }

    const expiry = DateTime.now().plus({ minutes: 15 });
    req.server.state.model("sudo-mode").set(req.session!.id, {
      expiry: expiry.toJSDate(),
    });

    return {
      expiry: expiry.toMillis(),
    };
  },
});
