import { Guards } from "..";
import { route } from "../utils/routeBuilder";

export default route({
  path: "/debug/require-auth",
  method: "GET",
  guards: [Guards.authenticated],
  async exec({ body }, req, res, fastify) {
    return {
      message: `Hello, @${
        req.user!.username
      }! You have proven your identity by authenticating`,
    };
  },
});

export const sudoRoute = route({
  path: "/debug/require-sudo",
  method: "GET",
  guards: [Guards.authenticated, Guards.sudo],
  async exec({ body }, req, res, fastify) {
    return {
      message: `Hello, @${
        req.user!.username
      }! You have proven your identity with sudo mode`,
    };
  },
});
