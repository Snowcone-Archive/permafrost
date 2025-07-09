import { DateTime } from "luxon";
import { Guards } from "../..";
import { randomAlphanumeric } from "../../utils/random";
import { route } from "../../utils/routeBuilder";

const CAN_RESEND_TIME = 1000 * 60 * 5;

export default route({
  path: "/users/send-verification-email",
  method: "POST",
  guards: [Guards.authenticated],
  async exec(_, req, res, fastify) {
    const { mail, state } = fastify;

    if (
      !req.user?.flags.includes("PendingEmailVerification") &&
      !req.user?.flags.includes("RequiresEmailVerification")
    ) {
      return res.status(400).send({
        error: {
          code: "AlreadyVerified",
          message: "Your email address has already been verified.",
        },
      });
    }

    const diff = DateTime.fromJSDate(
      (await state.model("email-verification").get(req.user!.id))?.lastSent ||
        new Date()
    )
      .diffNow()
      .as("milliseconds");

    if (diff > CAN_RESEND_TIME) {
      // Not rounding was done on purpose. I want this to be smack-in-the-face obvious.
      return res.status(429).send({
        error: {
          code: "RateLimited",
          message: `Verification emails may only be sent once every five minutes. Please wait another ${
            diff / 1000
          } seconds.`,
        },
      });
    }

    const token = randomAlphanumeric(32);

    await mail.sendMail({
      to: req.user!.email,
      subject: "Permafrost Email Verification",
      type: "verify-email",
      replacements: {
        displayname: req.user!.displayName || req.user!.username,
        verifyLink: `${
          fastify.config().backendUrl
        }/users/verify-email?token=${token}&user=${req.user!.id}`,
        expires: DateTime.now().plus({ seconds: 30 }).toLocaleString({
          weekday: "long",
          month: "long",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });

    state.model("email-verification").set(req.user!.id, {
      token,
      force: true,
      lastSent: new Date(),
      email: req.user!.email,
    });

    return res.send({ success: true });
  },
});
