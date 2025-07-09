import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { randomAlphanumeric } from "../../../utils/random";
import { route } from "../../../utils/routeBuilder";

export default route({
  path: "/passkey/login/start",
  method: "GET",
  guards: [],
  async exec(inputs, req, res, { config, state }) {
    const options = await generateAuthenticationOptions({
      rpID: config().applicationId,
      allowCredentials: [],
      userVerification: "preferred",
    });

    const sessionID = randomAlphanumeric(32);
    state.model("passkey-login-options").set(sessionID, {
      options,
    });

    return {
      sessionID: sessionID,
      options: options,
    };
  },
});
