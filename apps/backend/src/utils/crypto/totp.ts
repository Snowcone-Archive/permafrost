import type { PrismaClient, User } from "@prisma/client";
import { Secret, TOTP } from "otpauth";
import { warn } from "../logger";
import { randomInArray } from "../random";

/**
 * Checks if the supplied token is a valid TOTP code or backup code for the user.
 * The TOTP secret is fetched from te supplied ser.
 * Returns a boolean representing if the verification was successful.
 * If a valid backup code is supplied, it wil be invalidated in the database.
 * For checking only if the TOTP is valid (without the database and user part), use {@link verifyTotp}.
 */
export async function processTotp({
  token,
  user,
  prisma,
}: {
  user: User;
  token: string;
  prisma: PrismaClient;
}) {
  // Check if the inputted token is a backup token
  if (user.twoFactorBackupCodes.includes(token)) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFactorBackupCodes: {
          set: user.twoFactorBackupCodes.filter((c) => c !== token),
        },
      },
    });

    return true;
  }

  // Checks if the user supplied has TOTP enabled.
  // The helper function should only be used for TOTP-enabled users.
  // Returns false to stop authentication, as something is clearly wrong.|
  if (!user.twoFactor) {
    warn(
      `processTotp was called on a user without TOTP enabled. User id ${user.id}`
    );
    return false;
  }

  return verifyTotp({
    secret: user.twoFactor,
    token,
  });
}

/**
 * Verifies if a TOTP is valid, given the secret and token to check.
 * True is returned if the TOTP is correct, otherwise false.
 * If an issue occours, it will return false.
 * Periods are 30s, and codes are 6 digits.
 * There is a window of 1 time interval, meaning there are 3 possible valid codes for any secret: now-1, now, and now+1.
 * This is to account for clock differences, and practical since you have to type in the code.
 * There is a helper function available to also take care of backup codes, {@link processTotp}
 */
export function verifyTotp({
  secret,
  token,
}: {
  secret: string;
  token: string;
}) {
  const totp = new TOTP({
    secret,
  });

  return totp.validate({ token, window: 1 }) === null ? false : true;
}

/**
 * Generates a TOTP secret of length 20 and encodes it in base32.
 * Based on RFC-6238.
 */
export function randomTotpSecret() {
  return new Secret({ size: 20 }).base32;
}

/**
 * Generates 6 TOTP backup codes consisting of 10 characters.
 * The characters are based on Microsoft's product key alphabet for improved readability.
 */
export function randomBackupCodes() {
  return Array.from({ length: 6 }, () =>
    Array.from({ length: 10 }, () =>
      randomInArray("BCDFGHJKMPQRTVWXY2346789")
    ).join("")
  );
}
