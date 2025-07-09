import * as z from "zod/v4";
import { Guards } from "../..";
import { DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE } from "../../guards/hasFlag";
import { randomAlphanumeric } from "../../utils/random";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/applications",
  method: "POST",
  schema: {
    body: z.object({
      name: z.string(),
      homepageURL: z.string().optional(),
      termsOfServiceURL: z.string().optional(),
      privacyPolicyURL: z.string().optional(),
      redirectURIs: z.array(z.string()).optional(),
      collaborators: z.array(z.string()).optional(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.hasPermission("CreateApplication"),
    Guards.missingFlag(
      "RequiresEmailVerification",
      DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE
    ),
  ],
  async exec({ body }, req, res, fastify) {
    const { prisma } = fastify;
    const { user } = req;

    const clientSecret = randomAlphanumeric("clientSecret");
    const application = await prisma.application.create({
      data: {
        name: body.name,
        homepageURL: body.homepageURL,
        termsOfServiceURL: body.termsOfServiceURL,
        privacyPolicyURL: body.privacyPolicyURL,
        owner: {
          connect: {
            id: user!.id,
          },
        },
        collaborators:
          body.collaborators && body.collaborators.length > 0
            ? {
                connect: body.collaborators.map((id) => ({ id })),
              }
            : undefined,
        redirectURIs: body.redirectURIs || [],
        clientSecret,
      },
    });

    await req.auditLogEntry({
      affectedApplication: application,
      action: "application-created",
      description: `@${req.user!.username} created the application.`,
    });

    return res.status(200).send(application);
  },
});
