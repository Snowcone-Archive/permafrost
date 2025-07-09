import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/applications/:id/users",
  method: "GET",
  schema: {
    path: z.object({
      id: z.string(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.applicationParam,
    Guards.ownsApplication({ allowAdmin: "admin" }),
  ],
  async exec({ path }, req, res, fastify) {
    const { prisma } = fastify;
    const { id } = path;

    const user = req.user!;
    const application = req.application!;

    if (!application)
      return res.status(404).send({
        error: {
          code: "InexistentApplication",
          message: "The application does not exist.",
        },
      });

    const users = await prisma.user.findMany({
      where: {
        authorizations: {
          some: {
            applicationId: id,
          },
        },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        createdAt: true,
        authorizations: {
          where: {
            applicationId: id,
          },
          select: {
            createdAt: true,
          },
        },
      },
    });

    return res.status(200).send({
      users: users.map(({ authorizations, ...user }) => {
        return {
          ...user,
          authorizedDate: authorizations[0].createdAt,
        };
      }),
    });
  },
});
