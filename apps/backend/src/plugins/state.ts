import type { generateRegistrationOptions } from "@simplewebauthn/server";
import fp from "fastify-plugin";
import * as z from "zod/v4";
import { providerEnum } from "../routes/signin/oauth/verify";
import { success } from "../utils/logger";
import { emailSchema, ipSchema } from "../utils/validation";
import { ZodRedis } from "../utils/zodRedis";

const MIN_5 = 60 * 5;
const MIN_15 = 60 * 15;
const DAY_7 = 60 * 60 * 24 * 7;
const MONTH_3 = 60 * 60 * 24 * 30 * 3;

export const schemas = {
  "oauth-registration": {
    expirationSeconds: MIN_5,
    zod: z.object({
      expires: z.coerce.date(),
      provider: providerEnum,
      token: z.string(),
    }),
  },
  "user-login-token": {
    expirationSeconds: MIN_5,
    zod: z.object({
      userId: z.string(),
      expires: z.coerce.date(),
      token: z.string(),
      createdVia: z.enum(["GitHub", "Discord"]).optional(),
      notifyEmail: z.boolean(),
    }),
  },
  "user-login-2fa": {
    expirationSeconds: MIN_5,
    zod: z.object({
      token: z.string(),
      expires: z.coerce.date(),
    }),
  },
  session: {
    expirationSeconds: MONTH_3,
    zod: z.object({
      userId: z.string(),
      sessionId: z.string(),
      lastSeen: z.coerce.date(),
    }),
  },
  "sudo-mode": {
    expirationSeconds: MIN_15,
    zod: z.object({
      expiry: z.coerce.date(),
    }),
  },
  "email-verification": {
    expirationSeconds: MONTH_3,
    zod: z.object({
      token: z.string(),
      force: z.boolean(),
      email: emailSchema,
      lastSent: z.coerce.date(),
    }),
  },
  "account-creation": {
    expirationSeconds: DAY_7,
    zod: z.object({
      expires: z.coerce.date(),
      userId: z.string(),
    }),
  },
  "oauth-states": {
    expirationSeconds: MIN_5,
    zod: z.object({
      ip: ipSchema,
      expires: z.coerce.date(),
      link: z.string().optional(),
    }),
  },
  "passkey-registration-options": {
    expirationSeconds: MIN_5,
    zod: z.object({
      userId: z.string(),
      options:
        z.custom<Awaited<ReturnType<typeof generateRegistrationOptions>>>(),
    }),
  },
  "passkey-login-options": {
    expirationSeconds: MIN_5,
    zod: z.object({
      options: z.object({
        challenge: z.string(),
        timeout: z.number().optional(),
        rpId: z.string().optional(),
        allowCredentials: z
          .array(
            z.object({
              id: z.string(),
              type: z.enum(["public-key"]),
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
            })
          )
          .optional(),
        userVerification: z
          .enum(["discouraged", "preferred", "required"])
          .optional(),
        extensions: z
          .object({
            appid: z.string().optional(),
            credProps: z.boolean().optional(),
            hmacCreateSecret: z.boolean().optional(),
          })
          .optional(),
      }),
    }),
  },
};
export type StateType = ZodRedis<{ schema: typeof schemas }>;

declare module "fastify" {
  interface FastifyInstance {
    state: StateType;
  }
}

export const statePlugin = fp(async (fastify, options) => {
  const redis = new ZodRedis(fastify.config().redisUrl, {
    schema: schemas,
  });

  success("Initialized Zod-powered redis plugin");
  fastify.decorate("state", redis);
});
