import type { FastifyReply, FastifyRequest } from "fastify";

interface ownsApplicationOptions {
  allowAdmin: false | "super" | "admin";
}

export function ownsApplicationGuardFactory(
  opts: ownsApplicationOptions = { allowAdmin: "admin" }
) {
  return async function ownsApplicationGuard(
    req: FastifyRequest,
    res: FastifyReply
  ) {
    if (!req.user || !req.application)
      return res.status(500).send({
        error: "InternalServerError",
        message:
          "Serious skill issue in the backend (ownsApplication guard requires user guard and application guard)",
      });

    if (
      req.application.ownerId !== req.user.id &&
      !(
        opts.allowAdmin === "admin" &&
        (req.user.permissions.includes("Administrator") ||
          req.user.permissions.includes("SuperAdministrator"))
      ) &&
      !(
        opts.allowAdmin === "super" &&
        req.user.permissions.includes("SuperAdministrator")
      )
    ) {
      return res.status(403).send({
        error: {
          code: "Forbidden",
          message:
            "You do not have permission to do this action. Contact your local Administrator for help.",
        },
      });
    }

    if (opts.allowAdmin && req.user.permissions.includes("Administrator")) {
      req.operatingAsAdmin = true;
    }
  };
}
