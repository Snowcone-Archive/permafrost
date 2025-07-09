import * as z from "zod/v4";
import { Guards } from "../../..";
import { NOT_FOUND } from "../../../utils/consts";
import { route } from "../../../utils/routeBuilder";

export default route({
  path: "/users/me/passkeys/:id",
  method: "DELETE",
  schema: {
    path: z.object({
      id: z.string(),
    }),
  },
  guards: [Guards.authenticated, Guards.sudo],
  async exec(inputs, req, res, { prisma }) {
    const passkey = await prisma.passkey.delete({
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

    return {
      success: true,
    };
  },
});
