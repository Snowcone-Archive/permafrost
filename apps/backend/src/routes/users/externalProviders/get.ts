import * as z from "zod/v4";
import { Guards } from "../../..";
import { route } from "../../../utils/routeBuilder";

export default route({
  path: "/users/:id/external-providers",
  method: "GET",
  schema: {
    path: z.object({
      id: z.string(),
    }),
  },
  guards: [Guards.authenticated],
  async exec({ path }, req, res, fastify) {
    const { prisma } = fastify;

    if (
      path.id !== "me" &&
      req.user!.id !== path.id &&
      !req.user!.permissions.includes("Administrator")
    ) {
      return res.status(403).send({
        error: {
          code: "Forbidden",
          message: "You do not have permission to access this resource.",
        },
      });
    }

    const id = path.id === "me" ? req.user!.id : path.id;
    const loginMethods = await prisma.oAuthSignInData.findMany({
      where: {
        userId: id,
      },
      select: {
        platform: true,
        platformId: true,
        platformUsername: true,
        enableLogin: true,
      },
    });

    return loginMethods;
  },
});
