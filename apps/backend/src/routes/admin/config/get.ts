import { Guards } from "../../../";
import { editableConfigElements } from "../../../config";
import { route } from "../../../utils/routeBuilder";

export default route({
  path: "/admin/configuration",
  method: "GET",
  guards: [Guards.authenticated, Guards.hasPermission("Administrator")],
  async exec(_, req, res, fastify) {
    return res.send(editableConfigElements.parse(fastify.config()));
  },
});
