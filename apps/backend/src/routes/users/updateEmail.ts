import { DateTime } from "luxon";
import * as z from "zod/v4";
import { Guards } from "../..";
import { randomAlphanumeric } from "../../utils/random";
import { route } from "../../utils/routeBuilder";
import { emailSchema } from "../../utils/validation";

export default route({
  path: "/users/:id/email",
  method: "PATCH",
  schema: {
    body: z.object({
      newEmail: emailSchema,
      require: z.boolean().optional().default(false),
    }),
    path: z.object({
      id: z.string(),
    }),
  },
  guards: [Guards.authenticated, Guards.sudo],
  async exec({ body, path }, req, res, { prisma, mail, config, state }) {
    const { user, session } = req;
    if (!user || !session) return; // Will never happen

    const isMe = path.id === "me" || path.id === user.id;
    const isAdministrator = user.permissions.includes("Administrator");

    if (!isMe && !isAdministrator) {
      return res.status(403).send({
        error: {
          code: "Forbidden",
          message: "You do not have permission to perform this action.",
        },
      });
    }

    if (
      await prisma.user.findUnique({
        where: {
          email: body.newEmail,
        },
      })
    ) {
      return res.status(409).send({
        error: {
          code: "Conflict",
          message: "That email is already in use by a different user.",
        },
      });
    }

    prisma.user.update({
      where: { id: user.id },
      data: {
        email: body.newEmail,
        flags: {
          set: body.require
            ? [...user.flags, "RequiresEmailVerification"]
            : [...user.flags, "PendingEmailVerification"],
        },
      },
    });

    await req.auditLogEntry({
      affectedUser: user,
      action: "email-changed",
      description: `@${user.username} started email change from ${user.email} to ${body.newEmail}.`,
    });

    const token = randomAlphanumeric(32);

    await mail.sendMail({
      to: body.newEmail,
      subject: "Permafrost Email Verification",
      type: "verify-email",
      replacements: {
        displayname: req.user!.displayName || req.user!.username,
        verifyLink: `${
          config().backendUrl
        }/users/verify-email?token=${token}&user=${req.user!.id}`,
        expires: DateTime.now().plus({ minutes: 30 }).toLocaleString({
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
      force: false,
      email: body.newEmail,
      lastSent: new Date(),
    });

    return res.status(200).send({ success: true });
  },
});
