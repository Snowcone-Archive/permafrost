import * as z from "zod/v4";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/checkUsername/:username",
  method: "POST",
  schema: {
    path: z.object({
      username: z.string(),
    }),
  },
  async exec({ path }, req, res, fastify) {
    const { prisma, state } = fastify;
    const { username: usernameToCheck } = path;
    const authToken = req.headers.authorization?.replace("Bearer ", "");

    const token =
      (await state.model("oauth-registration").get(authToken!)) ||
      (await state.model("account-creation").get(authToken!)) ||
      null;

    if (!token || token.expires.getTime() < Date.now())
      res.status(401).send({
        error: {
          code: "Unauthorized",
          message: "Invalid authorization.",
        },
      });

    const user = await prisma.user.findUnique({
      where: {
        username: usernameToCheck,
      },
    });

    return { taken: !!user };
  },
});
