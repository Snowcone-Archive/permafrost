import * as z from "zod/v4";
import { Guards } from "../../..";
import { processTotp } from "../../../utils/crypto/totp";
import { route } from "../../../utils/routeBuilder";
import { otpSchema } from "../../../utils/validation";

export default route({
  path: "/users/me/2fa",
  method: "DELETE",
  schema: {
    body: z.object({
      otp: otpSchema,
    }),
  },
  guards: [Guards.authenticated, Guards.sudo],
  async exec({ body }, req, res, fastify) {
    const { prisma } = fastify;

    if (!req.user!.twoFactor) {
      return res.status(409).send({
        error: {
          code: "2FAAlreadyDisabled",
          message: "2FA is already disabled on this account.",
        },
      });
    }

    // We use processTotp as we want to permit backup codes
    if (!processTotp({ prisma, user: req.user!, token: body.otp }))
      return res.status(403).send({
        error: {
          code: "InvalidCredentials",
          field: "otp",
          message: "This two-factor authentication code is invalid.",
        },
      });

    await req.auditLogEntry({
      affectedUser: req.user!,
      action: "disable-2fa",
      description: "User disabled two-factor authentication.",
    });

    await prisma.user.update({
      where: {
        id: req.user!.id,
      },
      data: {
        twoFactor: null,
        twoFactorBackupCodes: [],
      },
    });

    return res.status(200).send({
      success: true,
    });
  },
});
