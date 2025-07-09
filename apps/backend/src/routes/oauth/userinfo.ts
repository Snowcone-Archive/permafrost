import * as auth from "../../utils/auth";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/oauth/userinfo",
  method: "GET",
  async exec({ path }, req, res, fastify) {
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
          code: tokenResult.code,
        },
      });

    const { state } = tokenResult;
    if (state.type !== "application")
      return res.send({
        error: {
          code: "Unauthorized",
          message: "Only applications can access this endpoint.",
        },
      });

    const user = await prisma.user.findFirst({
      where: {
        id: state.user.id,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: state.scopes.includes("email"),
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).send({
        code: "NotFound",
        resource: "User",
        message: "This user has not been found.",
      });
    }

    return res.send({
      sub: user.id,
      name: user.displayName,
      preferred_username: user.username,
      email: user.email,
      created_at: user.createdAt,
      picture: `${fastify.config().backendUrl}/users/${user.id}/avatar`,
    });
  },
});
