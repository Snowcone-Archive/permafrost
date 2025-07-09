import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/audit-log/purge",
  method: "DELETE",
  schema: {
    body: z.object({
      before: z.coerce.date(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.hasPermission("Administrator"),
    Guards.sudo,
  ],
  async exec({ body }, req, res, fastify) {
    const { prisma } = fastify;
    const { before } = body;

    if (before > new Date()) {
      return res.status(400).send({
        error: {
          code: "BadRequest",
          message: "Cannot purge logs before the current date.",
        },
      });
    }

    if (before > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)) {
      return res.status(400).send({
        error: {
          code: "BadRequest",
          message: "Cannot purge logs newer than a week ago.",
        },
      });
    }

    const where = {
      createdAt: {
        lt: before,
      },
    };

    const userAuditLogs = await prisma.userAuditLogEntry.deleteMany({
      where,
    });

    const applicationAuditLogs =
      await prisma.applicationAuditLogEntry.deleteMany({
        where,
      });

    const systemAuditLogs = await prisma.systemAuditLogEntry.deleteMany({
      where: {
        ...where,
        type: {
          not: "purge-audit-log",
        },
      },
    });

    const count =
      systemAuditLogs.count + userAuditLogs.count + applicationAuditLogs.count;

    req.auditLogEntry({
      action: "purge-audit-log",
      description: `Purged ${count} audit log entries${
        before ? ` before ${before.toLocaleDateString()}` : ""
      }.`,
    });

    return res.status(200).send({
      success: true,
      removed: count,
    });
  },
});
