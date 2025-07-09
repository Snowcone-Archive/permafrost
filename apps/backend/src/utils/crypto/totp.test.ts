import { DateTime } from "luxon";
import { Secret, TOTP } from "otpauth";
import { describe, expect, test } from "vitest";
import { randomBackupCodes, randomTotpSecret, verifyTotp } from "./totp";

// TODO: Test processTotp using Prisma mocking
// describe("TOTP processing", () => {
//   test("Should verify correct TOTP", () => {});
//   test("Should verify and delete correct backup code", () => {});
//   test("Should not verify invalid backup code", () => {});
// });

describe("TOTP code verification", () => {
  const secret1 = new Secret({ size: 20 }).base32;
  const secret2 = new Secret({ size: 20 }).base32;
  const generator = new TOTP({
    secret: secret1,
  });

  test("Should verify correct TOTP", () => {
    expect(
      verifyTotp({ secret: secret1, token: generator.generate() })
    ).toEqual(true);
  });

  test("Should verify previous interval's TOTP", () => {
    expect(
      verifyTotp({
        secret: secret1,
        token: generator.generate({
          timestamp: DateTime.now().minus({ seconds: 30 }).toMillis(),
        }),
      })
    ).toEqual(true);
  });

  test("Should not verify incorrect TOTP", () => {
    expect(
      verifyTotp({ secret: secret2, token: generator.generate() })
    ).toEqual(false);
  });

  test("Should not verify incorrect amount of digits", () => {
    expect(verifyTotp({ secret: secret1, token: "12345" })).toEqual(false);
  });

  test("Should not verify letters", () => {
    expect(verifyTotp({ secret: secret1, token: "123456ABC" })).toEqual(false);
  });

  test("Should not verify empty string", () => {
    expect(verifyTotp({ secret: secret1, token: "" })).toEqual(false);
  });
});

describe("TOTP secret generation", () => {
  test("Secret should be base32 and have correct length (100x)", () => {
    const re =
      /^(?:[A-Z2-7]{8})*(?:[A-Z2-7]{2}={6}|[A-Z2-7]{4}={4}|[A-Z2-7]{5}={3}|[A-Z2-7]{7}=)?$/;

    for (let x = 0; x < 100; x++) {
      const result = randomTotpSecret();
      expect(result.length).toBeGreaterThanOrEqual(20);
      expect(re.test(result)).toEqual(true);
    }
  });
});

describe("TOTP backup code generation", () => {
  test("Should use readable alphabet and have correct lengths (10x)", () => {
    const re = /^[BCDFGHJKMPQRTVWXY2346789]*$/;

    for (let x = 0; x < 10; x++) {
      const results = randomBackupCodes();
      expect(results.length).toBe(6);

      for (const result of results) {
        expect(result.length).toBe(10);
        expect(re.test(result)).toEqual(true);
      }
    }
  });
});
