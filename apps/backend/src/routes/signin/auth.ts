import { lookup } from "fast-geoip";
import * as z from "zod/v4";
import type { HostInfo } from "../../types";
import {
  getDeviceType,
  newAuthHandler,
  verifyPassword,
} from "../../utils/auth";
import { processTotp } from "../../utils/crypto/totp";
import { debug } from "../../utils/logger";
import { route } from "../../utils/routeBuilder";
import { emailSchema, otpSchema } from "../../utils/validation";

export default route({
  path: "/users/auth",
  method: "POST",
  schema: {
    body: z.object({
      email: emailSchema,
      password: z.string(),
      otp: otpSchema.optional(),
      backupCode: z.string().optional(),
    }),
  },
  rateLimit: 6,
  async exec({ body }, req, res, fastify) {
    const { prisma } = fastify;

    debug("Processing login request.");

    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (!user)
      return res.status(404).send({
        error: {
          code: "NotFound",
          resource: "User",
          message: "No users have been found with these credentials.",
        },
      });

    if (user.flags.includes("RequiresPasswordChange"))
      return res.status(428).send({
        error: {
          code: "PreconditionRequired",
          field: "password",
          message:
            "This account is required to change their password before logging in.",
        },
      });

    const pepperedPassword = user.passwordPepper
      ? body.password + fastify.config().pepper
      : body.password;

    if (!(await verifyPassword(user.password, pepperedPassword)))
      return res.status(404).send({
        error: {
          code: "NotFound",
          resource: "User",
          message: "No users have been found with these credentials.",
        },
      });

    if (user.twoFactor) {
      if (!body.otp && !body.backupCode)
        return res.status(428).send({
          error: {
            code: "PreconditionRequired",
            field: "otp",
            message: "Provide a two-factor authentication code.",
          },
        });

      if (body.backupCode) {
        if (!user?.twoFactorBackupCodes.includes(body.backupCode)) {
          return res.status(403).send({
            error: {
              code: "Unauthorized",
              field: "backupCode",
            },
          });
        }

        // Remove backup code (can't be reused)
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            twoFactorBackupCodes: {
              set: user.twoFactorBackupCodes.filter(
                (v) => v !== body.backupCode
              ),
            },
          },
        });
      } else if (
        body.otp &&
        !(await processTotp({ prisma, user, token: body.otp }))
      )
        return res.status(403).send({
          error: {
            code: "InvalidField",
            field: "otp",
            message: "This two-factor authentication code is invalid.",
          },
        });

      if (user.flags.includes("Disabled"))
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
      "Email"
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
        method: "email and password",
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
