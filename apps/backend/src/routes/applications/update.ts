import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/applications/:id",
  method: "POST",
  schema: {
    body: z.object({
      name: z.string().optional(),
      homepageURL: z.url().or(z.string().length(0)).optional(),
      termsOfServiceURL: z.url().or(z.string().length(0)).optional(),
      privacyPolicyURL: z.url().or(z.string().length(0)).optional(),
    }),
    path: z.object({
      id: z.string(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.applicationParam,
    Guards.collaborator({ allowAdmin: "admin" }),
  ],
  async exec({ body, path }, req, res, fastify) {
    const { prisma } = fastify;
    const { id } = path;
    const { name, homepageURL, termsOfServiceURL, privacyPolicyURL } = body;

    await req.auditLogEntry({
      affectedApplication: {
        id,
        name: name || req.application!.name,
      },
      action: "application-updated",
      description: `@${
        req.user!.username
      } changed information about this application.`,
    });

    const updatedApplication = await prisma.application.update({
      where: {
        id,
      },
      data: {
        name,
        homepageURL,
        termsOfServiceURL,
        privacyPolicyURL,
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
        collaborators: {
          select: {
            id: true,
            username: true,
            displayName: true,
            createdAt: true,
          },
        },
        createdAt: true,
        redirectURIs: true,
      },
    });

    return res.status(200).send(updatedApplication);
  },
});
