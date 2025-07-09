import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/applications/:id/transfer",
  method: "POST",
  schema: {
    path: z.object({
      id: z.string(),
    }),
    body: z.object({
      to: z.cuid2(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.applicationParam,
    Guards.ownsApplication({ allowAdmin: "admin" }),
    Guards.sudo,
  ],
  async exec({ path, body }, req, res, fastify) {
    const { prisma } = fastify;

    if (!req.application)
      return res.status(404).send({
        error: {
          code: "NotFound",
          resource: "Application",
          message: "This application has not been found.",
        },
      });

    const receivingUser = await prisma.user.findUnique({
      where: {
        id: body.to,
      },
    });

    if (!receivingUser)
      return res.status(404).send({
        error: {
          code: "NotFound",
          resource: "User",
          message:
            "The user you are trying to transfer this application to does not exist.",
        },
      });

    if (receivingUser.id === req.application.ownerId)
      return res.status(400).send({
        error: {
          code: "BadRequest",
          message: "You cannot transfer an application to its current owner.",
        },
      });

    if (!receivingUser.permissions.includes("CreateApplication"))
      return res.status(400).send({
        error: {
          code: "BadRequest",
          message:
            "You cannot transfer an application to a user that does not have permission to create applications.",
        },
      });

    if (receivingUser.flags.includes("RequiresEmailVerification"))
      return res.status(400).send({
        error: {
          code: "BadRequest",
          message:
            "You cannot transfer an application to a user that has not verified their email address.",
        },
      });

    if (receivingUser.flags.includes("Disabled"))
      return res.status(400).send({
        error: {
          code: "BadRequest",
          message: "You cannot transfer an application to a disabled user.",
        },
      });

    await req.auditLogEntry({
      affectedApplication: {
        id: req.application.id,
        name: req.application.name,
      },
      action: "application-transferred",
      description: `@${req.user!.username} transferred this application to @${
        receivingUser.username
      }.`,
    });

    await prisma.application.update({
      where: {
        id: path.id,
      },
      data: {
        owner: {
          connect: {
            id: body.to,
          },
        },
        collaborators: {
          connect: {
            id: req.user!.id,
          },
        },
      },
    });

    return res.status(200).send({
      success: true,
    });
  },
});
