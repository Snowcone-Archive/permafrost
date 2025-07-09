import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/audit-log",
  method: "GET",
  schema: {
    query: z.object({
      start: z.coerce.date().optional(),
      end: z.coerce.date().optional(),
      index: z.int().optional(),
      take: z.int().min(1).max(500).optional(),
      executingUserId: z.string().optional(),
      sortBy: z.enum(["newest", "oldest"]).optional(),
    }),
  },
  guards: [Guards.authenticated, Guards.hasPermission("Administrator")],
  async exec({ query }, req, res, fastify) {
    const { prisma } = fastify;

    const { start, end, index, take, executingUserId, sortBy } = query;

    const where = {
      executingUserId,
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    const userAuditLogs = await prisma.userAuditLogEntry.findMany({
      where,
    });

    const applicationAuditLogs = await prisma.applicationAuditLogEntry.findMany(
      {
        where,
      }
    );

    const systemAuditLogs = await prisma.systemAuditLogEntry.findMany({
      where,
    });

    const all = [
      ...userAuditLogs.map((log) => ({
        id: log.id,
        executingUser: {
          id: log.executingUserId,
          username: log.executingUserUsername,
        },
        affectedUser: {
          id: log.affectedUserId,
          username: log.affectedUserUsername,
        },
        action: log.type,
        description: log.description,
        createdAt: log.createdAt,
        type: "user",
      })),
      ...applicationAuditLogs.map((log) => ({
        id: log.id,
        executingUser: {
          id: log.executingUserId,
          username: log.executingUserUsername,
        },
        affectedApplication: {
          id: log.affectedApplicationId,
          name: log.affectedApplicationName,
        },
        action: log.type,
        description: log.description,
        createdAt: log.createdAt,
        type: "application",
      })),
      ...systemAuditLogs.map((log) => ({
        id: log.id,
        executingUser: {
          id: log.executingUserId,
          username: log.executingUserUsername,
        },
        action: log.type,
        description: log.description,
        createdAt: log.createdAt,
        type: "system",
      })),
    ]
      .filter((log) => {
        if (start && end) {
          return log.createdAt >= start && log.createdAt <= end;
        } else if (start) {
          return log.createdAt >= start;
        } else if (end) {
          return log.createdAt <= end;
        }
        return true;
      })
      .sort(
        sortBy === "newest"
          ? (a, b) => (a.createdAt > b.createdAt ? -1 : 1)
          : (a, b) => (a.createdAt > b.createdAt ? 1 : -1)
      );

    return res.status(200).send({
      total: all.length,
      entries: all.slice(index || 0, (index || 0) + (take || 100)),
    });
  },
});
