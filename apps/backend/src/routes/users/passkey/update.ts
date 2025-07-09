import * as z from "zod/v4";
import { Guards } from "../../..";
import { NOT_FOUND } from "../../../utils/consts";
import { route } from "../../../utils/routeBuilder";
export default route({
  path: "/users/me/passkeys/:id",
  method: "PATCH",
  schema: {
    body: z.object({
      name: z.string().max(32).min(1).optional(),
    }),
    path: z.object({
      id: z.string(),
    }),
  },
  guards: [Guards.authenticated],
  async exec(inputs, req, res, { prisma }) {
    const passkey = await prisma.passkey.findFirst({
      where: {
        id: inputs.path.id,
        userId: req.user!.id,
      },
    });

    if (!passkey) {
      return res.status(404).send({
        error: NOT_FOUND,
      });
    }

    const { name } = inputs.body;
    const newPasskey = await prisma.passkey.update({
      where: {
        id: passkey.id,
      },
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
        transports: true,
        lastUsed: true,
        createdAt: true,
      },
    });

    return newPasskey;
  },
});
