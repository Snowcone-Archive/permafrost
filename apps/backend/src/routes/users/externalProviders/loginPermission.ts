import * as z from "zod/v4";
import { Guards } from "../../..";
import { route } from "../../../utils/routeBuilder";

export default route({
  path: "/users/:id/external-providers/:provider/login-permission",
  method: "PUT",
  schema: {
    body: z.object({
      enabled: z.boolean(),
    }),
    path: z.object({
      id: z.string(),
      provider: z.enum(["Discord", "GitHub"]),
    }),
  },
  guards: [Guards.authenticated],
  async exec({ path, body }, req, res, fastify) {
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

    await prisma.oAuthSignInData.updateMany({
      where: {
        userId: id,
        platform: path.provider,
      },
      data: {
        enableLogin: body.enabled,
      },
    });

    return { success: true };
  },
});
