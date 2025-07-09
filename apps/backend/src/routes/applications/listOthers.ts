import z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/users/:id/applications",
  method: "GET",
  schema: {
    path: z.object({
      id: z.string().optional(),
    }),
  },
  guards: [Guards.authenticated, Guards.hasPermission("Administrator")],
  async exec({ path }, req, res, fastify) {
    const { prisma } = fastify;

    const id = path.id === "me" ? req.user!.id : path.id;

    const applications = await prisma.application.findMany({
      where: {
        ownerId: id,
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
