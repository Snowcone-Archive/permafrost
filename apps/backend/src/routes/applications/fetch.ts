import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/applications/:id",
  method: "GET",
  schema: {
    path: z.object({
      id: z.string(),
    }),
  },
  guards: [Guards.authenticated, Guards.applicationParam],
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

    const role =
      application.ownerId === user.id
        ? "owner"
        : application.collaborators.some(
              (collaborator) => collaborator.id === user.id
            )
          ? "collaborator"
          : user.permissions.includes("Administrator")
            ? "admin"
            : undefined;

    const applicationData = await prisma.application.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        homepageURL: true,
        termsOfServiceURL: true,
        privacyPolicyURL: true,
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            createdAt: true,
          },
        },
        collaborators: !!role
          ? {
              select: {
                id: true,
                username: true,
                displayName: true,
                createdAt: true,
              },
            }
          : undefined,
        createdAt: true,
        redirectURIs: true,
      },
    });

    const authorizations = await prisma.authorization.findMany({
      where: {
        applicationId: id,
      },
    });

    const isAuthorized = authorizations.some(
      (authorization) => authorization.userId === user.id
    );

    return res.status(200).send({
      ...applicationData,
      role: role === "admin" ? undefined : role,
      isAuthorized,
      users: authorizations.length,
    });
  },
});
