import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/users/:userId/sessions/:sessionId",
  method: "DELETE",
  schema: {
    path: z.object({
      userId: z.cuid2(),
      sessionId: z.cuid2(),
    }),
  },
  guards: [Guards.authenticated],
  async exec({ body, path }, req, res, fastify) {
    const { prisma } = fastify;

    if (path.userId === "me") {
      path.userId = req.user!.id;
    }

    if (
      req.user!.id !== path.userId &&
      !req.user?.permissions.includes("Administrator")
    ) {
      return res.status(403).send({
        error: "You do not have permission to delete this session",
      });
    }

    const session = await prisma.session.findUnique({
      where: {
        id: path.sessionId,
      },
    });

    if (!session) {
      return res.status(404).send({
        error: {
          code: "NotFound",
          message: "Session not found",
        },
      });
    }

    await prisma.session.delete({
      where: {
        id: path.sessionId,
      },
    });

    fastify.metrics.sessions.dec();

    await req.auditLogEntry({
      affectedUser: req.user!,
      action: "session-deleted",
      description: `Session ${path.sessionId} was deleted.`,
    });

    return res.status(200).send({
      success: true,
    });
  },
});
