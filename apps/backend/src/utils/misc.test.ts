import { describe, expect, test } from "vitest";
import { makeArrayIfNeeded } from "./misc";

describe("Make array if needed", () => {
  test("Converts a number to an array", () => {
    expect(makeArrayIfNeeded(2)).toEqual([2]);
  });

  test("Converts a string to an array", () => {
    expect(makeArrayIfNeeded("Hello World!")).toEqual(["Hello World!"]);
  });

  test("Converts a function to an array", () => {
    const result = makeArrayIfNeeded(() => {
      return 1 + 1;
    });

    expect(result).length(1);
    expect(result[0]).toBeTypeOf("function");
    expect(result[0]()).toEqual(2);
  });

  test("Returns itself given a single-entry number array", () => {
    expect(makeArrayIfNeeded([2])).toEqual([2]);
  });

  test("Returns itself given a single-entry function array", () => {
    const result = makeArrayIfNeeded([
      () => {
        return 1 + 1;
      },
    ]);

    expect(result).length(1);
    expect(result[0]).toBeTypeOf("function");
    expect(result[0]()).toEqual(2);
  });

  test("Returns itself given a multi-entry number array", () => {
    expect(makeArrayIfNeeded([3, 2, 1])).toEqual([3, 2, 1]);
  });

  test("Returns itself given a multi-entry function array", () => {
    const result = makeArrayIfNeeded([
      () => {
        return 1 + 1;
      },
      () => {
        return 1 + 2;
      },
    ]);

    expect(result).length(2);
    expect(result[0]).toBeTypeOf("function");
    expect(result[1]).toBeTypeOf("function");
    expect(result[0]()).toEqual(2);
    expect(result[1]()).toEqual(3);
  });
});
