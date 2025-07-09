import * as z from "zod/v4";
import { randomAlphanumeric } from "../../utils/random";

import { DateTime } from "luxon";
import { hashPassword } from "../../utils/auth";
import { route } from "../../utils/routeBuilder";
import { usernameSchema } from "../../utils/validation";

export default route({
  path: "/users/finish-creation",
  method: "POST",
  schema: {
    body: z.object({
      username: usernameSchema,
      password: z.string(),
    }),
  },
  async exec({ body }, req, res, fastify) {
    const { prisma, state } = fastify;

    const token = req.headers.authorization?.replace("Bearer ", "");
    const creationData = await state.model("account-creation").get(token!);

    if (!token || !creationData || new Date() > creationData.expires) {
      return res.status(400).send({
        error: {
          code: "InvalidState",
          message: "The state provided is invalid or has expired.",
        },
      });
    }

    // Check if the user already exists.
    const userWithUsername = await prisma.user.findFirst({
      where: {
        username: body.username,
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

    const user = await prisma.user.findUnique({
      where: {
        id: creationData.userId,
      },
    });

    // Update the user.
    const newUser = await prisma.user.update({
      where: {
        id: creationData.userId,
      },
      data: {
        username: body.username,
        flags: {
          set: user!.flags.filter(
            (f) => f !== "Pending" && f !== "RequiresPasswordChange"
          ),
        },
        password: await hashPassword(body.password + fastify.config().pepper),
        passwordPepper: true,
      },
    });

    await req.auditLogEntry({
      executingUser: newUser,
      affectedUser: newUser,
      action: "user-setup-finished",
      description: `User @${newUser.username} finished setting up their account.`,
    });

    // Create a login token and send it to the user.
    const loginToken = randomAlphanumeric(64);
    state.model("user-login-token").set(loginToken, {
      userId: newUser.id,
      expires: DateTime.now().plus({ minutes: 5 }).toJSDate(),
      token,
      createdVia: undefined,
      notifyEmail: false,
    });

    return res.status(200).send({
      token: loginToken,
    });
  },
});
