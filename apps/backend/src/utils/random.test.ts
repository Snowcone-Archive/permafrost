import { describe, expect, test } from "vitest";
import {
  randomAlphanumeric,
  randomBetween,
  randomInArray,
  tokenLengthMapping,
} from "./random";

describe("Random number between", () => {
  test("In range 1 -> 10, no decimals (100x)", () => {
    for (let x = 0; x < 100; x++) {
      const result = randomBetween(0, 10);
      expect(result).within(0, 10 + 1); // Our function is inclusive on both ends
      expect(Number.isInteger(result)).toEqual(true); // No decimals
    }
  });

  test("Supports high-to-low range (100x)", () => {
    for (let x = 0; x < 100; x++) {
      const result = randomBetween(10, 0);
      expect(result).within(0, 10 + 1); // Our function is inclusive on both ends
      expect(Number.isInteger(result)).toEqual(true); // No decimals
    }
  });

  test("Supports negative numbers (100x)", () => {
    for (let x = 0; x < 100; x++) {
      const result = randomBetween(-10, 10);
      expect(result).within(-10, 10 + 1); // Our function is inclusive on both ends
      expect(Number.isInteger(result)).toEqual(true); // No decimals
    }
  });

  test("Supports negative numbers in high-to-low range (100x)", () => {
    for (let x = 0; x < 100; x++) {
      const result = randomBetween(10, -10);
      expect(result).within(-10, 10 + 1); // Our function is inclusive on both ends
      expect(Number.isInteger(result)).toEqual(true); // No decimals
    }
  });
});

describe("Random entry in array", () => {
  test("All entries are selected a few times each in a high sample size (100x)", () => {
    const arr = ["A", "B", "C"];
    let total = { A: 0, B: 0, C: 0 };

    for (let x = 0; x < 100; x++) {
      const result = randomInArray(arr);
      expect(arr.includes(result)).toEqual(true); // To only have values from the array
      total[result as "A" | "B" | "C"]++;
    }

    expect(total.A).toBeGreaterThanOrEqual(5);
    expect(total.B).toBeGreaterThanOrEqual(5);
    expect(total.C).toBeGreaterThanOrEqual(5);
  });

  test("Array with only one entry (100x)", () => {
    for (let x = 0; x < 100; x++) {
      const result = randomInArray(["A"]);
      expect(result).toEqual("A");
    }
  });
});

describe("Alphanumeric generation", () => {
  test("Character set, duplicates, length - Static length (100x)", () => {
    const re = /^[0-9a-zA-Z]*$/;
    let previous: string[] = [];

    for (let x = 0; x < 100; x++) {
      const result = randomAlphanumeric(24);
      expect(result.length).toBe(24);
      expect(re.test(result)).toEqual(true);
      expect(previous.includes(result)).toEqual(false);

      previous.push(result);
    }
  });

  test("Character set, duplicates, length - Dynamic length (100x)", () => {
    const re = /^[0-9a-zA-Z]*$/;
    let previous: string[] = [];

    for (let x = 0; x < 100; x++) {
      const result = randomAlphanumeric(x);
      expect(result.length).toBe(x);
      expect(re.test(result)).toEqual(true);
      expect(previous.includes(result)).toEqual(false);

      previous.push(result);
    }
  });

  test("Character set, length - Token length", () => {
    const re = /^[0-9a-zA-Z]*$/;

    for (const x in tokenLengthMapping) {
      const tokenType = x as keyof typeof tokenLengthMapping;
      const result = randomAlphanumeric(tokenType);
      expect(result.length).toBe(tokenLengthMapping[tokenType]);
      expect(re.test(result)).toEqual(true);
    }
  });
});
