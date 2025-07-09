import { AccountPermissions } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";

// This guard **must** be called, as it will return a guard.
// Authorization permissions will also be in this function
export function hasPermission(permissionNode: AccountPermissions) {
  return async function authenticationGuard(
    req: FastifyRequest,
    res: FastifyReply
  ) {
    if (!req.user)
      return res.status(500).send({
        error: "InternalServerError",
        message: "Serious skill issue in the backend",
      });

    if (!req.user.permissions.includes(permissionNode))
      return res.status(403).send({
        error: {
          code: "Forbidden",
          message:
            "You do not have permission to do this action. Contact your local Administrator for help.",
        },
      });
  };
}
