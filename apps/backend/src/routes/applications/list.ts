import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/applications",
  method: "GET",
  guards: [Guards.authenticated],
  async exec(inputs, req, res, fastify) {
    const { prisma } = fastify;

    const applications = await prisma.application.findMany({
      where: {
        OR: [
          {
            ownerId: req.user!.id,
          },
          {
            collaborators: {
              some: {
                id: req.user!.id,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        redirectURIs: true,
        owner: {
          select: {
            id: true,
            displayName: true,
            createdAt: true,
            username: true,
          },
        },
      },
    });

    return res.status(200).send({
      applications: await Promise.all(
        applications.map(async (application) => {
          return {
            ...application,
            role:
              application.owner.id === req.user!.id ? "owner" : "collaborator",
            users: await prisma.authorization.count({
              where: {
                applicationId: application.id,
              },
            }),
          };
        })
      ),
    });
  },
});
