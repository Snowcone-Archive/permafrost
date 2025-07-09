import type { z } from "zod/v4";
import { Guards } from "../../..";
import { editableConfigElements } from "../../../config";
import { route } from "../../../utils/routeBuilder";

export default route({
  path: "/admin/configuration",
  method: "PATCH",
  schema: {
    body: editableConfigElements.partial(),
  },
  guards: [
    Guards.authenticated,
    Guards.hasPermission("SuperAdministrator"),
    Guards.sudo,
  ],
  async exec({ body }, req, res, fastify) {
    for (const [key, value] of Object.entries(body)) {
      fastify.configManager.set(
        key as keyof z.output<typeof editableConfigElements>, // We know this is true since the body validates it.
        value
      );

      req.auditLogEntry({
        action: "modify-configuration",
        description: `The config option ${key} has been set to ${value}.`,
      });
    }

    return res.send(editableConfigElements.parse(fastify.config()));
  },
});
