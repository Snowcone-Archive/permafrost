import { generateRegistrationOptions } from "@simplewebauthn/server";
import { Guards } from "../../../..";
import { route } from "../../../../utils/routeBuilder";

export default route({
  path: "/users/me/passkey/registration/start",
  method: "GET",
  guards: [Guards.authenticated],
  async exec(inputs, req, res, { prisma, config, state }) {
    const existingPasskeys = await prisma.passkey.findMany({
      where: {
        userId: req.user!.id,
      },
    });

    const options = await generateRegistrationOptions({
      rpName: config().applicationName,
      rpID: config().applicationId,
      userName: req.user!.username,
      timeout: 60000,
      attestationType: "none",
      excludeCredentials: existingPasskeys.map((passkey) => ({
        id: passkey.id,
      })),
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "preferred",
      },
    });

    state.model("passkey-registration-options").set(req.user!.id, {
      userId: req.user!.id,
      options,
    });

    return options;
  },
});
