import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/applications/:id/redirect-uris",
  method: "POST",
  schema: {
    body: z.object({
      add: z.array(z.url()).optional(),
      remove: z.array(z.string()).optional(),
      set: z.array(z.url()).optional(),
    }),
    path: z.object({
      id: z.cuid2(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.applicationParam,
    Guards.ownsApplication({ allowAdmin: false }),
  ],
  async exec({ body, path: { id } }, req, res, fastify) {
    const { prisma } = fastify;

    if ((body.set && body.remove) || (body.set && body.add)) {
      return res.status(400).send({
        error: {
          code: "InvalidRequest",
          message: "Cannot set and add/remove collaborators at the same time.",
        },
      });
    }

    if (!body.set && !body.add && !body.remove) {
      return res.status(400).send({
        error: {
          code: "InvalidRequest",
          message: "You must provide a set, add, or remove key.",
        },
      });
    }

    if (body.add?.length === 0 || body.remove?.length === 0) {
      return res.status(400).send({
        error: {
          code: "InvalidRequest",
          message: "You must provide at least one collaborator.",
        },
      });
    }

    // Get initial collaborators
    const initialRedirectUrls = (
      await prisma.application.findFirst({
        where: {
          id,
        },
        select: {
          redirectURIs: true,
        },
      })
    )?.redirectURIs!;

    // Get the updated collaborator list
    let redirectUris: string[] = [...initialRedirectUrls];

    if (body.set) {
      redirectUris = body.set;
    } else {
      if (body.add) redirectUris.push(...body.add);

      if (body.remove !== undefined) {
        redirectUris = redirectUris.filter(
          (redirectURI) => !body.remove!.includes(redirectURI)
        );
      }
    }

    // Remove duplicates
    redirectUris = redirectUris.filter(
      (value, index, self) => self.indexOf(value) === index
    );

    // Updated
    const updatedApplication = await prisma.application.update({
      where: {
        id,
      },
      data: {
        redirectURIs: {
          set: redirectUris,
        },
      },
      select: {
        redirectURIs: true,
      },
    });

    initialRedirectUrls!.forEach(async (initialURL) => {
      if (
        !updatedApplication.redirectURIs.some((newURL) => newURL === initialURL)
      ) {
        await req.auditLogEntry({
          affectedApplication: req.application!,
          action: "redirect-removed",
          description: `@${
            req.user!.username
          } disallowed redirects to ${initialURL}.`,
        });
      }
    });

    updatedApplication.redirectURIs.forEach(async (newURL) => {
      if (!initialRedirectUrls!.some((oldRedirect) => oldRedirect === newURL)) {
        await req.auditLogEntry({
          affectedApplication: req.application!,
          action: "redirect-added",
          description: `@${
            req.user!.username
          } allowed redirects to @${newURL}.`,
        });
      }
    });

    return res.status(200).send({
      redirectUris: updatedApplication.redirectURIs,
    });
  },
});
