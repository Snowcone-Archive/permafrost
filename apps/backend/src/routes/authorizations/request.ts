import * as z from "zod/v4";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/authorizations/token/:code",
  method: "GET",
  schema: {
    path: z.object({
      code: z.string(),
    }),
  },
  async exec({ path }, req, res, fastify) {
    const { prisma } = fastify;
    const { code } = path;

    let requestCode = await prisma.tokenRequestCode.findFirst({
      where: {
        id: code,
      },
      select: {
        id: true,
        createdAt: true,
        authorization: {
          select: {
            id: true,
            application: {
              select: {
                id: true,
                name: true,
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
            token: true,
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (
      requestCode &&
      Date.now() > requestCode.createdAt.getTime() + 5 * 60 * 1000
    ) {
      await prisma.tokenRequestCode.delete({ where: { id: requestCode.id } });
      requestCode = null;
    }

    if (!requestCode)
      return res.status(404).send({
        error: {
          code: "NotFound",
          resource: "Code",
          message:
            "This token request code has not been found or has already expired.",
        },
      });

    return requestCode.authorization;
  },
});
