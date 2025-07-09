import { DateTime } from "luxon";
import * as z from "zod/v4";
import { Guards } from "../..";
import { DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE } from "../../guards/hasFlag";
import { route } from "../../utils/routeBuilder";
import { displayNameSchema, usernameSchema } from "../../utils/validation";

export default route({
  path: "/users/:id",
  method: "PATCH",
  schema: {
    path: z.object({
      id: z.string(),
    }),
    body: z.object({
      username: usernameSchema.optional(),
      displayName: displayNameSchema.optional(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.missingFlag(
      "RequiresEmailVerification",
      DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE
    ),
  ],
  async exec({ body, path }, req, res, fastify) {
    const { prisma } = fastify;
    const { username, displayName } = body;
    const { user, session } = req;
    if (!user || !session) return; // Will never happen!

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

    const id = isMe ? user.id : path.id;

    if ((await prisma.user.count({ where: { id } })) === 0) {
      return res.status(404).send({
        error: {
          code: "NotFound",
          message: "User not found.",
        },
      });
    }

    // Find user
    if (
      username &&
      (await prisma.user.findUnique({
        where: {
          username,
        },
      }))
    ) {
      return res.status(400).send({
        error: {
          code: "UsernameCollision",
          field: "username",
          message: "This username is already in use.",
        },
      });
    }

    // Require sudo for username change
    if (username) {
      await Guards.sudo(req, res);

      const sudoModeState = await req.server.state
        .model("sudo-mode")
        .get(req.session!.id);

      if (
        !sudoModeState ||
        DateTime.now() > DateTime.fromJSDate(sudoModeState.expiry)
      )
        return res.status(428).send({
          error: {
            code: "SudoModeRequired",
            message: "You need to enter sudo mode to perform this action.",
          },
        });

      await req.auditLogEntry({
        affectedUser: user,
        action: "username-changed",
        description: `@${username} changed their username from @${user.username}.`,
      });
    }

    // Log display name change
    if (displayName) {
      await req.auditLogEntry({
        affectedUser: user,
        action: "display-name-changed",
        description: `@${username} changed their display name from ${user.displayName} to ${displayName}.`,
      });
    }

    // Update
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        displayName,
        username: username?.toLowerCase(),
      },
    });

    return res.status(200).send({
      success: true,
    });
  },
});
