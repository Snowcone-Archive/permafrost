import {
  verifyAuthenticationResponse,
  type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { lookup } from "fast-geoip";
import * as z from "zod/v4";
import type { HostInfo } from "../../../types";
import { getDeviceType, newAuthHandler } from "../../../utils/auth";
import { error } from "../../../utils/logger";
import { route } from "../../../utils/routeBuilder";

export default route({
  path: "/passkey/login/complete",
  method: "POST",
  guards: [],
  schema: {
    body: z.object({
      id: z.string(),
      sessionID: z.string(),
      rawId: z.string(),
      response: z.object({
        clientDataJSON: z.string(),
        authenticatorData: z.string(),
        signature: z.string(),
        userHandle: z.string().optional(),
      }),
      clientExtensionResults: z.object({
        appid: z.boolean().optional(),
        credProps: z
          .object({
            rk: z.boolean().optional(),
          })
          .optional(),
        hmacCreateSecret: z.boolean().optional(),
      }),
      type: z.enum(["public-key"]),
    }),
  },

  async exec(inputs, req, res, fastify) {
    const { body } = inputs;
    const { prisma, config, state } = fastify;

    const stateValue = await state
      .model("passkey-login-options")
      .get(body.sessionID);

    if (!stateValue) {
      return res.status(400).send({
        error: {
          code: "NotFound",
          resource: "Session",
          message: "No session has been found with these credentials.",
        },
      });
    }

    const currentOptions = stateValue.options;

    const passkey = await prisma.passkey.findFirst({
      where: {
        id: body.id,
      },
    });

    if (!passkey) {
      return res.status(400).send({
        error: {
          code: "NotFound",
          resource: "Passkey",
          message: "No users have been found with these credentials.",
        },
      });
    }

    // Check verification
    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: config().frontendUrl,
        expectedRPID: config().applicationId,
        credential: {
          id: passkey.id,
          publicKey: passkey.publicKey,
          counter: passkey.counter,
          transports: passkey.transports as AuthenticatorTransportFuture[],
        },
        requireUserVerification: false,
      });
    } catch (err) {
      error(err);
      return res.status(400).send({
        error: {
          code: "BadRequest",
          message: "Verification failed.",
        },
      });
    }

    const { verified } = verification;

    if (!verified) {
      return res.status(400).send({
        error: {
          code: "BadRequest",
          message: "Verification failed.",
        },
      });
    }

    const { authenticationInfo } = verification;
    const { newCounter } = authenticationInfo;

    // Update passkey information
    await prisma.passkey.update({
      where: {
        id: passkey.id,
      },
      data: {
        counter: newCounter,
        lastUsed: new Date(),
      },
    });

    // Authenticate the user
    const user = await prisma.user.findFirst({
      where: {
        id: passkey.userId,
      },
    });

    if (!user) {
      return res.status(400).send({
        error: {
          code: "NotFound",
          resource: "User",
          message: "No users have been found with these credentials.",
        },
      });
    }

    const host: HostInfo = {
      address: req.ip,
      device: getDeviceType(req.headers["user-agent"]),
    };

    const authHandler = await newAuthHandler(fastify);
    const session = await authHandler.startSession(
      user,
      host,
      fastify.config().backendUrl,
      "Passkey"
    );

    await req.auditLogEntry({
      affectedUser: user,
      executingUser: user,
      action: "login",
      description: "User logged in.",
    });

    const location = await lookup(session.ipAddress);

    await fastify.mail.sendMail({
      subject: "Permafrost Login",
      user,
      type: "login",
      replacements: {
        displayname: user.displayName || user.username,
        method: "passkey",
        location: location
          ? location.city + ", " + location.region + ", " + location.country
          : "somewhere, presumably",
      },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        flags: user.flags,
        permissions: user.permissions,
        createdAt: user.createdAt,
        twoFactorEnabled: user.twoFactor != undefined,
      },
      session: {
        id: session.id,
        token: session.token,
        lastActivity: session.lastActivity,
      },
    };
  },
});
