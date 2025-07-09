import * as z from "zod/v4";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/oauth/token",
  method: "POST",
  schema: {
    body: z.object({
      client_id: z.string(),
      client_secret: z.string(),
      code: z.string(),
    }),
  },
  async exec({ body }, req, res, fastify) {
    const { prisma } = fastify;

    const tokenRequestCode = await prisma.tokenRequestCode.findUnique({
      where: {
        id: body.code,
        authorization: {
          application: {
            id: body.client_id,
            clientSecret: body.client_secret,
          },
        },
      },
      select: {
        authorization: true,
      },
    });

    if (!tokenRequestCode) {
      return res.status(400).send({
        error: {
          code: "InvalidCode",
          message: "The code provided is invalid.",
        },
      });
    }

    return {
      token_type: "Bearer",
      access_token: tokenRequestCode.authorization.token,
      id_token: tokenRequestCode.authorization.token,
      scope: tokenRequestCode.authorization.scopes,
    };
  },
});
