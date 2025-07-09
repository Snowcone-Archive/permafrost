import { DateTime } from "luxon";
import { Guards } from "../../..";
import { DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE } from "../../../guards/hasFlag";
import { randomTotpSecret } from "../../../utils/crypto/totp";
import { route } from "../../../utils/routeBuilder";

export default route({
  path: "/users/me/2fa/begin",
  method: "POST",
  guards: [
    Guards.authenticated,
    Guards.missingFlag(
      "RequiresEmailVerification",
      DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE
    ),
  ],
  async exec(inputs, req, res, fastify) {
    const { state } = fastify;

    if (req.user!.twoFactor) {
      return res.status(409).send({
        error: {
          code: "2FAAlreadyEnabled",
          message: "2FA is already enabled on this account.",
        },
      });
    }

    const twoFactorToken = randomTotpSecret();

    const expiry = DateTime.now().plus({ minutes: 5 });
    state.model("user-login-2fa").set(req.user!.id, {
      token: twoFactorToken,
      expires: expiry.toJSDate(),
    });

    // todo: expires --> expiresIn
    return res.status(200).send({
      expires: expiry.toMillis(),
      totpUrl: `otpauth://totp/${
        req.user!.email
      }?secret=${twoFactorToken}&issuer=SnowflakePermafrost`,
      secret: twoFactorToken,
    });
  },
});
