import type { FastifyReply, FastifyRequest } from "fastify";

export async function outOfBoxGuard(req: FastifyRequest, res: FastifyReply) {
  if (
    !req.server.config().outOfBoxExperience ||
    (await req.server.prisma.user.count()) > 0
  )
    return res.status(403).send({
      error: {
        code: "Forbidden",
        message:
          "You do not have permission to do this action, as the out of box experience is not available.",
      },
    });
}
