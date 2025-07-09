import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/users/:id/authorizations",
  method: "GET",
  schema: {
    path: z.object({
      id: z.string().optional(),
    }),
  },
  guards: [Guards.authenticated, Guards.hasPermission("Administrator")],
  async exec({ path }, req, res, fastify) {
    const id = path.id === "me" ? req.user!.id : path.id;

    const { prisma } = fastify;

    const authorizations = await prisma.authorization.findMany({
      where: {
        userId: id,
      },
      select: {
        id: true,
        application: {
          select: {
            _count: {
              select: {
                authorizations: true,
              },
            },
            id: true,
            name: true,
            createdAt: true,
            owner: {
              select: {
                username: true,
                displayName: true,
                id: true,
                createdAt: true,
              },
            },
          },
        },
        createdAt: true,
        scopes: true,
      },
    });

    return res.status(200).send({
      authorizations: authorizations.map((authorization) => {
        return {
          id: authorization.id,
          application: {
            id: authorization.application.id,
            name: authorization.application.name,
            owner: {
              id: authorization.application.owner.id,
              username: authorization.application.owner.username,
              displayName: authorization.application.owner.displayName,
              createdAt: authorization.application.owner.createdAt,
            },
            createdAt: authorization.application.createdAt,
            authorizations: authorization.application._count.authorizations,
          },
          createdAt: authorization.createdAt,
          scopes: authorization.scopes,
        };
      }),
    });
  },
});
