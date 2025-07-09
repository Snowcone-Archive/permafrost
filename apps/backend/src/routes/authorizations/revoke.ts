import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/authorizations/:id",
  method: "DELETE",
  schema: {
    path: z.object({
      id: z.string(),
    }),
  },
  guards: [Guards.authenticated],
  async exec({ path }, req, res, fastify) {
    const { prisma } = fastify;

    const existing = await prisma.authorization.findFirst({
      where: {
        id: path.id,
      },
      include: {
        user: true,
        requestCode: true,
      },
    });

    if (!existing || existing.userId !== req.user!.id)
      return res.status(404).send({
        error: {
          code: "NotFound",
          resource: "Authorization",
          message: "This authorization does not exist.",
        },
      });

    if (existing.requestCode)
      await prisma.tokenRequestCode.delete({
        where: { id: existing.requestCode.id },
      });

    await prisma.authorization.delete({ where: { id: existing.id } });
    return res.status(200).send({
      success: true,
    });
  },
});
