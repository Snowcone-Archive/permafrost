import { Guards } from "../../..";
import { DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE } from "../../../guards/hasFlag";
import { randomBackupCodes } from "../../../utils/crypto/totp";
import { route } from "../../../utils/routeBuilder";

export default route({
  path: "/users/me/2fa/reset-backup-codes",
  method: "POST",
  guards: [
    Guards.authenticated,
    Guards.missingFlag(
      "RequiresEmailVerification",
      DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE
    ),
    Guards.sudo,
  ],
  async exec(inputs, req, res, fastify) {
    const { prisma } = fastify;

    if (!req.user!.twoFactor) {
      return res.status(412).send({
        code: "No2FA",
        message: "2FA is not enabled for your account!",
      });
    }

    const codes = randomBackupCodes();
    await prisma.user.update({
      where: {
        id: req.user!.id,
      },
      data: {
        twoFactorBackupCodes: codes,
      },
    });

    return {
      codes,
    };
  },
});
