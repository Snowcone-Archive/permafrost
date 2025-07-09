import { fileTypeFromBuffer } from "file-type";
import { DateTime } from "luxon";
import * as z from "zod/v4";
import { warn } from "../../../utils/logger";
import { randomAlphanumeric } from "../../../utils/random";
import { route } from "../../../utils/routeBuilder";
import { providerNames, providers } from "./verify";

export default route({
  path: "/oauth/create/:provider",
  method: "POST",
  schema: {
    body: z
      .object({
        username: z.string().optional(),
      })
      .optional(),
    path: z.object({
      provider: z.enum(["discord" as const, "github" as const]),
    }),
  },
  rateLimit: 3,
  async exec({ path, body }, req, res, fastify) {
    const { prisma, state, storage } = fastify;

    // Check if registration is enabled.
    if (!fastify.config().oauthSignups) {
      return res.status(403).send({
        error: {
          code: "RegistrationDisabled",
          message: "Registration is currently disabled.",
        },
      });
    }

    // Get the state and token.
    const registrationToken = req.headers.authorization?.replace("Bearer ", "");
    const stateContent = await state
      .model("oauth-registration")
      .get(registrationToken!);

    if (
      !registrationToken ||
      !stateContent ||
      new Date() > stateContent.expires
    ) {
      return res.status(400).send({
        error: {
          code: "InvalidState",
          message: "The state provided is invalid or has expired.",
        },
      });
    }

    const { token } = stateContent;

    // Get user data.
    const provider = providers[path.provider];
    const userData = await provider.getMetadata(token, fastify);

    if (userData.success === false) {
      return res.status(userData.code).send({
        error: userData.error,
      });
    }

    // Check if the username is taken.
    const userWithUsername = await prisma.user.findFirst({
      where: {
        username: body?.username || userData.username,
      },
    });

    if (userWithUsername) {
      return res.status(409).send({
        error: {
          code: "UsernameTaken",
          message: "The username provided is already taken.",
        },
      });
    }

    // Create the user.
    const newUser = await prisma.user.create({
      data: {
        username: body?.username || userData.username,
        displayName: body?.username || userData.username,
        email: userData.email,
        oauthSignInData: {
          create: {
            platform: providerNames[path.provider]!,
            platformId: userData.id.toString(),
            platformUsername: userData.username,
          },
        },
        password: "",
        flags: {
          set: ["RequiresPasswordChange", "RequiresEmailVerification"],
        },
      },
    });

    // Send verification email.
    const verifyToken = randomAlphanumeric(32);

    await fastify.mail.sendMail({
      to: newUser.email,
      subject: "Permafrost Email Verification",
      type: "verify-email",
      replacements: {
        displayname: newUser.displayName || newUser.username,
        verifyLink: `${
          fastify.config().backendUrl
        }/users/verify-email?token=${verifyToken}&user=${newUser!.id}`,
        expires: DateTime.now().plus({ minutes: 5 }).toLocaleString({
          weekday: "long",
          month: "long",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });

    state.model("email-verification").set(newUser!.id, {
      token: verifyToken,
      force: true,
      lastSent: new Date(),
      email: newUser.email,
    });

    // Log the creation of the user.
    await req.auditLogEntry({
      executingUser: newUser,
      affectedUser: newUser,
      action: `user-created-${path.provider}`,
      description: `User @${newUser.username} was created via ${
        providerNames[path.provider]
      }.`,
    });

    // Try to fetch the user's avatar and upload it to the storage.
    try {
      const bucket = await storage.bucket("avatars");
      const file = await (await fetch(userData.avatarUrl)).arrayBuffer();
      const type = await fileTypeFromBuffer(file);
      const allowedTypes = [
        "image/png",
        "image/apng",
        "image/gif",
        "image/jpeg",
      ];

      if (type && allowedTypes.some((t) => t === type.mime)) {
        const handle = await bucket.file(`${newUser.id}`);
        handle && (await handle.write(Buffer.from(file)));
      }
    } catch (err) {
      warn(":", err);
    }

    // Create a login token and send it to the user.
    const loginToken = randomAlphanumeric(64);
    state.model("user-login-token").set(loginToken, {
      userId: newUser.id,
      expires: DateTime.now().plus({ minutes: 5 }).toJSDate(),
      token,
      createdVia: "GitHub",
      notifyEmail: false,
    });

    return res.status(200).send({
      token: loginToken,
    });
  },
});
