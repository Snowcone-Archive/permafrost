import * as z from "zod/v4";

export const usernameSchema = z
  .string()
  .min(3)
  .max(32)
  .regex(/^[0-9a-zA-Z_.]{3,32}$/g)
  .trim()
  .toLowerCase();

export const displayNameSchema = z.string().trim().min(1).max(64);

// Email addresses are generally case-insensitive, so it's user friendly to automatically lowercase them.
// They are also generally limited to less than 320 character, so we set a hard limit at 400 characters.
export const emailSchema = z.email().toLowerCase().min(1).max(400);

// We must support both IPv4 and IPv6 addresses.
export const ipSchema = z.union([z.ipv4(), z.ipv6()]);

export const scopeSchema = z.enum(["profile", "email", "openid"]);
export const scopesSchema = z
  .array(scopeSchema)
  .min(1)
  .transform((arr) => arr.filter((v) => v !== "openid"));

// Needs to be a string because 012345 would be transformed into 12345 if it was an integer
export const otpSchema = z.string().trim().length(6);
