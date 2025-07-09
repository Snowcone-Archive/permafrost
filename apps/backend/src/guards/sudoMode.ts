import type { FastifyReply, FastifyRequest } from "fastify";
import { DateTime } from "luxon";

export async function sudoModeGuard(req: FastifyRequest, res: FastifyReply) {
  const { state } = req.server;

  if (!req.user)
    return res.status(500).send({
      error: "InternalServerError",
      message: "Serious skill issue in the backend",
    });

  const data = await state.model("sudo-mode").get(req.session!.id);

  if (!data || DateTime.now() > DateTime.fromJSDate(data.expiry))
    return res.status(428).send({
      error: {
        code: "SudoModeRequired",
        message: "You need to enter sudo mode to perform this action.",
      },
    });
}
