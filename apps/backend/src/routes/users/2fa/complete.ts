import * as z from "zod/v4";
import { Guards } from "../../..";
import { randomBackupCodes, verifyTotp } from "../../../utils/crypto/totp";
import { route } from "../../../utils/routeBuilder";

export default route({
  path: "/users/me/2fa/complete",
  method: "POST",
  schema: {
    body: z.object({
      otp: z.string(),
    }),
  },
  guards: [Guards.authenticated],
  async exec({ body }, req, res, fastify) {
    const { prisma, state } = fastify;

    if (req.user!.twoFactor) {
      return res.status(409).send({
        error: {
          code: "2FAAlreadyEnabled",
          message: "2FA is already enabled on this account.",
        },
      });
    }

    const mfaState = await state.model("user-login-2fa").get(req.user!.id);
    if (!mfaState || mfaState.expires.getTime() < Date.now()) {
      state.model("user-login-2fa").delete(req.user!.id);

      return res.status(400).send({
        error: {
          code: "NoState",
          message:
            "A 2FA state could not be found. Please try again from the beginning.",
        },
      });
    }

    // We use verifyTotp instead of processTotp as we don't want to allow backup codes.
    if (!verifyTotp({ secret: mfaState.token, token: body.otp }))
      return res.status(403).send({
        error: {
          code: "InvalidField",
          field: "otp",
          message: "This two-factor authentication code is invalid.",
        },
      });

    const backupCodes = randomBackupCodes();

    await prisma.user.update({
      where: {
        id: req.user!.id,
      },
      data: {
        twoFactor: mfaState.token,
        twoFactorBackupCodes: backupCodes,
      },
    });

    await req.auditLogEntry({
      affectedUser: req.user!,
      action: "enable-2fa",
      description: "User enabled two-factor authentication",
    });

    return res.status(200).send({
      success: true,
      backupCodes,
    });
  },
});
