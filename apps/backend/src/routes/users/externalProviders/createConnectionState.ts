import { DateTime } from "luxon";
import { Guards } from "../../..";
import { randomAlphanumeric } from "../../../utils/random";
import { route } from "../../../utils/routeBuilder";

export const getStateParameter = route({
  path: "/users/:id/connection-state",
  method: "GET",
  guards: [Guards.authenticated],
  async exec(_, req, res, { state }) {
    const token = randomAlphanumeric(32);

    state.model("oauth-states").set(token, {
      ip: req.ip,
      expires: DateTime.now().plus({ minutes: 5 }).toJSDate(),
      link: req.user!.id,
    });

    return res.status(200).send({ token });
  },
});
