import * as z from "zod/v4";
import { Guards } from "../..";
import { hashPassword, verifyPassword } from "../../utils/auth";
import { processTotp } from "../../utils/crypto/totp";
import { route } from "../../utils/routeBuilder";
import { otpSchema } from "../../utils/validation";

export default route({
  path: "/users/me/password",
  method: "PATCH",
  schema: {
    body: z.object({
      existing: z.string().min(4).max(64).optional(),
      new: z.string().min(4).max(64),
      otp: otpSchema.optional(),
      deleteOtherSessions: z.boolean().optional(),
    }),
  },
  guards: [Guards.authenticated],
  async exec({ body }, req, res, { prisma, config }) {
    const { user, session } = req!;
    if (!user || !session) return;

    const canChangeWithoutExistingPassword =
      user.flags.includes("RequiresPasswordChange") || user.password == "";
    const existingPasswordValid = await verifyPassword(
      user.password,
      body.existing
        ? user?.passwordPepper
          ? body.existing + config().pepper
          : body.existing
        : ""
    );

    // Verify password
    // If they are required to reset their password, they can change it without the old password
    // as long as their current password is empty.
    if (!existingPasswordValid && !canChangeWithoutExistingPassword) {
      return res.status(400).send({
        error: {
          code: "InvalidCredentials",
          resource: "Password",
          message: "Incorrect existing password.",
        },
      });
    }

    if (user.twoFactor) {
      if (body.otp === undefined) {
        return res.status(428).send({
          error: {
            code: "PreconditionRequired",
            resource: "otp",
            message:
              "One-time password is required to update this account's password.",
          },
        });
      }

      if (!(await processTotp({ prisma, user, token: body.otp })))
        return res.status(403).send({
          error: {
            code: "InvalidField",
            field: "otp",
            message: "This two-factor authentication code is invalid.",
          },
        });
    }

    await req.auditLogEntry({
      affectedUser: user,
      action: "password-changed",
      description: `@${user.username} changed their password.`,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hashPassword(body.new + config().pepper),
        passwordPepper: true,
        sessions: body.deleteOtherSessions
          ? {
              deleteMany: {
                userId: user.id,
                id: {
                  not: session.id,
                },
              },
            }
          : undefined,
        flags: {
          set: user.flags.filter((f) => f !== "RequiresPasswordChange"),
        },
      },
    });

    return res.status(200).send({ success: true });
  },
});
