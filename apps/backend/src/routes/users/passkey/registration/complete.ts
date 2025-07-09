import {
  verifyRegistrationResponse,
  type VerifiedRegistrationResponse,
} from "@simplewebauthn/server";
import * as z from "zod/v4";
import { Guards } from "../../../..";
import { error } from "../../../../utils/logger";
import { route } from "../../../../utils/routeBuilder";

export const PasskeyOptionsSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  name: z.string().max(32).min(1).optional(),
  response: z.object({
    clientDataJSON: z.string(),
    attestationObject: z.string(),
    authenticatorData: z.string().optional(),
    transports: z
      .array(
        z.enum([
          "ble",
          "cable",
          "hybrid",
          "internal",
          "nfc",
          "smart-card",
          "usb",
        ])
      )
      .optional(),
    publicKeyAlgorithm: z.number().optional(),
    publicKey: z.string().optional(),
  }),
  authenticatorAttachment: z.enum(["cross-platform", "platform"]).optional(),
  clientExtensionResults: z.object({
    appId: z.string().optional(),
    credProps: z
      .object({
        rk: z.boolean().optional(),
      })
      .optional(),
    hmacCreateSecret: z.boolean().optional(),
  }),
  type: z.enum(["public-key"]),
});

export default route({
  path: "/users/me/passkey/registration/complete",
  method: "POST",
  schema: {
    body: PasskeyOptionsSchema,
  },
  guards: [Guards.authenticated],
  async exec(inputs, req, res, { prisma, config, state }) {
    const options = await state
      .model("passkey-registration-options")
      .get(req.user!.id);

    if (options === null) {
      return res.status(400).send({
        error: {
          code: "BadRequest",
          message: "No registration options found for this user.",
        },
      });
    }

    let verification: VerifiedRegistrationResponse;
    try {
      verification = await verifyRegistrationResponse({
        response: inputs.body,
        expectedChallenge: options!.options.challenge,
        expectedOrigin: config().frontendUrl,
        expectedRPID: config().applicationId,
        requireUserVerification: false,
      });
    } catch (err) {
      error(err);
      return res.status(400).send({
        error: {
          code: "BadRequest",
          message: "Invalid registration response.",
        },
      });
    }

    const { verified } = verification;

    if (verified) {
      const { registrationInfo } = verification!;
      const { credential, credentialDeviceType, credentialBackedUp } =
        registrationInfo!;

      await prisma.passkey.create({
        data: {
          id: inputs.body.id,
          name: inputs.body.name,
          webauthnUserID: options.options.user.id,
          userId: options.userId,
          publicKey: Buffer.from(credential.publicKey),
          counter: 0,
          deviceType: credentialDeviceType,
          backedUp: credentialBackedUp,
          transports: inputs.body.response.transports,
        },
      });
    }

    return {
      verified,
    };
  },
});
