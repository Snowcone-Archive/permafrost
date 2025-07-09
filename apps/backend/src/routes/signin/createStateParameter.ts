import { DateTime } from "luxon";
import { randomAlphanumeric } from "../../utils/random";
import { route } from "../../utils/routeBuilder";

export const getStateParameter = route({
  path: "/oauth/create-state",
  method: "GET",
  rateLimit: 3,
  async exec(inputs, req, res, { state }) {
    const oAuthStateToken = randomAlphanumeric(32);

    state.model("oauth-states").set(oAuthStateToken, {
      ip: req.ip,
      expires: DateTime.now().plus({ minutes: 5 }).toJSDate(),
    });

    return res.status(200).send({ state });
  },
});
