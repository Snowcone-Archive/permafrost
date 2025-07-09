import * as z from "zod/v4";
import * as auth from "../../utils/auth";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/users/search",
  method: "GET",
  schema: {
    query: z.object({
      username: z.string().min(3),
    }),
  },
  async exec({ query }, req, res, fastify) {
    const { prisma } = fastify;

    if (!req.headers.authorization)
      return res.status(401).send({
        error: {
          code: "Unauthorized",
          message: "Authorization is needed to get the requesting user.",
        },
      });

    const token = String(req.headers.authorization).replace("Bearer ", "");
    const authHandler = await auth.newAuthHandler(fastify);

    const tokenResult = await authHandler.checkToken(token);
    if (tokenResult.success == false)
      return res.status(tokenResult.status || 400).send({
        error: {
          error: tokenResult.code,
        },
      });

    const { state } = tokenResult;
    if (state.type !== "session")
      return res.status(403).send({
        error: {
          code: "ActionNotAllowed",
          message: "This action cannot be performed by applications.",
        },
      });

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query.username,
        },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    });

    return users;
  },
});
