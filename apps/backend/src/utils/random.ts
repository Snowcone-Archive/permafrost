import { randomInt } from "crypto";

/**
 * Generates a secure-ish random integer between minInclusive and maxInclusive
 * @param minInclusive An integer representing the minimum number to generate, inclusive
 * @param maxInclusive An integer representing the maximum number to generate, inclusive
 */
export function randomBetween(minInclusive: number, maxInclusive: number) {
  const input1 = Math.ceil(minInclusive);
  const input2 = Math.floor(maxInclusive);
  const min = Math.min(input1, input2);
  const max = Math.max(input1, input2) + 1;
  return randomInt(min, max);
}

/**
 * Returns a random element in the supplied array or string
 * @param arr The array or string to choose an element from
 */
export function randomInArray<T>(arr: Array<T> | string) {
  return arr.at(randomBetween(0, arr.length - 1))!;
}

export const tokenLengthMapping = {
  clientSecret: 64,
  passwordReset: 32,
};

/**
 * Generates a secure-ish random string consisting of alphanumeric characters
 * @param length Integer representing length of string to generate, or the type of token
 */
export function randomAlphanumeric(
  length: keyof typeof tokenLengthMapping | number
) {
  return Array.from(
    {
      length: typeof length === "number" ? length : tokenLengthMapping[length],
    },
    () => {
      return randomInArray(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      );
    }
  ).join("");
}
