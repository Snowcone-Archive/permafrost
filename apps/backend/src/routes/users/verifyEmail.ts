import { DateTime } from "luxon";
import z from "zod/v4";
import { route } from "../../utils/routeBuilder";

const CAN_RESEND_TIME = 1000 * 60 * 5;

export default route({
  path: "/users/verify-email",
  method: "GET",
  schema: {
    query: z.object({
      user: z.cuid2(),
      token: z.string().length(32),
    }),
  },
  guards: [],
  async exec({ query }, req, res, fastify) {
    const { prisma, state } = fastify;

    const verification = await state
      .model("email-verification")
      .get(query.user);

    if (
      !verification ||
      DateTime.fromJSDate(verification.lastSent).diffNow().as("milliseconds") >
        CAN_RESEND_TIME
    ) {
      return res.redirect(
        `${
          fastify.config().frontendUrl
        }/dashboard?message=emailVerificationDoesNotExist`
      );
    }

    const flags = await prisma.user.findUnique({
      where: { id: query.user },
      select: { flags: true },
    });

    if (flags == undefined) {
      return res.redirect(
        `${fastify.config().frontendUrl}/dashboard?message=internalError`
      );
    }

    console.log(verification);

    await prisma.user.update({
      where: { id: query.user },
      data: {
        email: verification.email,
        flags: {
          set: flags.flags.filter(
            (flag) =>
              flag !== "RequiresEmailVerification" &&
              flag !== "PendingEmailVerification"
          ),
        },
      },
    });

    return res.redirect(
      `${fastify.config().frontendUrl}/dashboard?message=emailVerified`
    );
  },
});
