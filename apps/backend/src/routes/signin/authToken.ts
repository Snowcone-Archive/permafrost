import { lookup } from "fast-geoip";
import * as z from "zod/v4";
import type { HostInfo } from "../../types";
import { getDeviceType, newAuthHandler } from "../../utils/auth";
import { route } from "../../utils/routeBuilder";
import { otpSchema } from "../../utils/validation";

export default route({
  path: "/users/auth/token",
  method: "POST",
  schema: {
    body: z.object({
      token: z.string().length(64),
      otp: otpSchema.optional(),
    }),
  },
  rateLimit: 3,
  async exec(inputs, req, res, fastify) {
    const { prisma, state } = fastify;
    const token = await state.model("user-login-token").get(inputs.body.token);

    if (
      !token ||
      token.expires.getTime() < Date.now() ||
      token.userId === null
    ) {
      return res.status(404).send({
        error: {
          code: "NotFound",
          resource: "Token",
          message: "This token does not exist or has expired.",
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: token.userId },
    });

    if (!user) {
      return res.status(404).send({
        error: {
          code: "NotFound",
          resource: "User",
          message: "This user does not exist.",
        },
      });
    }

    if (user.flags.includes("Disabled")) {
      return res.status(403).send({
        error: {
          code: "AccountDisabled",
          message: "Your account has been disabled.",
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
      token.createdVia
    );

    await req.auditLogEntry({
      affectedUser: user,
      executingUser: user,
      action: `login-${token.createdVia || "token"}`,
      description: `Used logged in via ${
        token.createdVia || "an unknown source"
      }`,
    });

    const location = await lookup(session.ipAddress);

    if (token.notifyEmail !== false) {
      await fastify.mail.sendMail({
        subject: "Permafrost Login",
        user,
        type: "login",
        replacements: {
          displayname: user.displayName || user.username,
          method: token.createdVia || "Unknown",
          location: location
            ? location.city + ", " + location.region + ", " + location.country
            : "nowhere, apparently",
        },
      });
    }

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
