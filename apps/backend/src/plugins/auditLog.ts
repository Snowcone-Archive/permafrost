import fp from "fastify-plugin";
import { debug, success } from "../utils/logger";

type CreateAuditLogEntryOptions = {
  executingUser?: {
    id: string;
    username: string;
  };
  affectedUser?: {
    id: string;
    username: string;
  };
  affectedApplication?: {
    id: string;
    name: string;
  };
  action: string;
  description: string;
  details?: { [key: string]: any };
};

declare module "fastify" {
  interface FastifyRequest {
    auditLogEntry: (opts: CreateAuditLogEntryOptions) => Promise<void>;
  }
}

export const auditLogPlugin = fp(async (fastify, options) => {
  success("Initialized audit log utility plugin");

  fastify.decorateRequest(
    "auditLogEntry",
    async function createAuditLogEntry(opts: CreateAuditLogEntryOptions) {
      const req = this;
      const prisma = req.server.prisma;
      debug(`Creating audit log entry`);

      const executing = {
        executingUserId: opts.executingUser?.id || req.user!.id,
        executingUserUsername:
          opts.executingUser?.username || req.user!.username,
      };

      if (opts.affectedApplication) {
        await prisma.applicationAuditLogEntry.create({
          data: {
            description: opts.description,
            type: opts.action,
            details: opts.details,
            ...executing,
            affectedApplicationId: opts.affectedApplication.id,
            affectedApplicationName: opts.affectedApplication.name,
          },
        });
      } else if (opts.affectedUser) {
        await prisma.userAuditLogEntry.create({
          data: {
            description: opts.description,
            type: opts.action,
            details: opts.details,
            ...executing,
            affectedUserId: opts.affectedUser.id,
            affectedUserUsername: opts.affectedUser.username,
          },
        });
      } else {
        await prisma.systemAuditLogEntry.create({
          data: {
            description: opts.description,
            type: opts.action,
            details: opts.details,
            ...executing,
          },
        });
      }

      debug("Created debug log entry.");
    }
  );
});
