import { DateTime } from "luxon";
import * as z from "zod/v4";
import { Guards } from "../..";
import { randomAlphanumeric } from "../../utils/random";
import { route } from "../../utils/routeBuilder";
import { emailSchema } from "../../utils/validation";

export default route({
  path: "/users",
  method: "POST",
  schema: {
    body: z.object({
      email: emailSchema,
    }),
  },
  guards: [Guards.authenticated, Guards.hasPermission("Administrator")],
  async exec({ body }, req, res, fastify) {
    const { prisma, mail } = fastify;

    if ((await prisma.user.count({ where: { email: body.email } })) > 0)
      return res.status(409).send({
        error: {
          code: "AlreadyExists",
          resource: "User",
          field: "Email",
        },
      });

    const temporaryUsername = `pending-${randomAlphanumeric(8)}`;

    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: temporaryUsername,
        password: "",
        flags: ["RequiresPasswordChange", "Pending"],
      },
      select: {
        id: true,
        username: true,
        resetData: true,
      },
    });

    const loginToken = randomAlphanumeric("passwordReset");
    fastify.state.model("account-creation").set(loginToken, {
      expires: DateTime.now().plus({ days: 7 }).toJSDate(),
      userId: user.id,
    });

    const createLink = `${
      fastify.config().frontendUrl
    }/auth/create?type=email&token=${loginToken}`;

    await mail.sendMail({
      to: body.email,
      subject: "Permafrost Account Creation",
      type: "account-created",
      replacements: {
        link: createLink,
      },
    });

    await req.auditLogEntry({
      affectedUser: user,
      action: "user-created",
      description: `User ${body.email} was created.`,
    });

    return {
      id: user.id,
    };
  },
});
