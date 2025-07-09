import { AccountFlags } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";

export const DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE =
  "You must verify your email before you can perform this action.";

// This guard **must** be called, as it will return a guard.
export function hasFlag(flag: AccountFlags) {
  return async function authenticationGuard(
    req: FastifyRequest,
    res: FastifyReply
  ) {
    if (!req.user)
      return res.status(500).send({
        error: "InternalServerError",
        message: "Serious skill issue in the backend",
      });

    if (!req.user.flags.includes(flag))
      return res.status(403).send({
        error: {
          code: "Forbidden",
          message:
            "You do not have permission to do this action. Contact your local Administrator for help.",
        },
      });
  };
}

// This guard **must** be called, as it will return a guard.
export function missingFlag(flag: AccountFlags, customMessage?: string) {
  return async function authenticationGuard(
    req: FastifyRequest,
    res: FastifyReply
  ) {
    if (!req.user)
      return res.status(500).send({
        error: "InternalServerError",
        message: "Serious skill issue in the backend",
      });

    if (req.user.flags.includes(flag))
      return res.status(403).send({
        error: {
          code: "Forbidden",
          message:
            customMessage ||
            "You do not have permission to do this action. Contact your local Administrator for help.",
        },
      });
  };
}
