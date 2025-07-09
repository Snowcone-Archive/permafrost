import { AuthorizationScopes } from "@prisma/client";
import * as z from "zod/v4";
import { Guards } from "../..";
import { DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE } from "../../guards/hasFlag";
import * as auth from "../../utils/auth";
import { route } from "../../utils/routeBuilder";
import { scopesSchema } from "../../utils/validation";

export default route({
  path: "/authorizations",
  method: "POST",
  schema: {
    body: z.object({
      application: z.string(),
      scopes: scopesSchema,
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.missingFlag(
      "RequiresEmailVerification",
      DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE
    ),
  ],
  async exec({ body }, req, res, fastify) {
    const { prisma } = fastify;
    const { application: appId, scopes } = body;

    const application = await prisma.application.findFirst({
      where: {
        id: appId,
      },
    });

    if (!application)
      return res.status(404).send({
        error: {
          code: "NotFound",
          message: "This application does not exist.",
        },
      });

    const existing = await prisma.authorization.findFirst({
      where: {
        applicationId: application.id,
        userId: req.user!.id,
      },
    });

    const newJwt = await auth.createApplicationJWT({
      applicationId: application.id,
      issuedBy: fastify.config().backendUrl,
      userId: req.user!.id,
      sessionId: req.session!.id,
    });

    const authorization = await prisma.authorization.upsert({
      where: {
        id: existing?.id || "",
      },
      update: {
        scopes: scopes as AuthorizationScopes[],
        token: newJwt,
      },
      create: {
        scopes: scopes as AuthorizationScopes[],
        token: newJwt,
        applicationId: application.id,
        userId: req.user!.id,
      },
      select: {
        id: true,
        application: {
          select: {
            id: true,
            name: true,
          },
        },
        scopes: true,
      },
    });

    let requestCode = await prisma.tokenRequestCode.findFirst({
      where: {
        authorizationId: authorization.id,
      },
    });

    if (!requestCode) {
      requestCode = await prisma.tokenRequestCode.create({
        data: {
          authorizationId: authorization.id,
        },
      });
    }

    return { ...authorization, requestCode: requestCode.id };
  },
});
