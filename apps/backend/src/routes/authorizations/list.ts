import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/authorizations",
  method: "GET",
  guards: [Guards.authenticated],
  async exec(inputs, req, res, fastify) {
    const { prisma } = fastify;

    const authorizations = await prisma.authorization.findMany({
      where: {
        userId: req.user!.id,
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
