import { describe, expect, test, vi } from "vitest";
import { debug, error, info, success, warn } from "./logger";

const consoleLogMock = vi
  .spyOn(console, "log")
  .mockImplementation(() => undefined);
const consoleWarnMock = vi
  .spyOn(console, "warn")
  .mockImplementation(() => undefined);
const consoleErrorMock = vi
  .spyOn(console, "error")
  .mockImplementation(() => undefined);

describe("Loggers print single-argument to stdout", () => {
  test("Success logger reflects string to stdout", () => {
    success("My success");

    expect(consoleLogMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("[+]"),
      "My success"
    );
  });

  test("Info logger reflects string to stdout", () => {
    info("My information");

    expect(consoleLogMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("[@]"),
      "My information"
    );
  });

  test("Debugger logger reflects string to stdout", () => {
    debug("My debug");

    // TODO: fix this test
    expect(consoleLogMock).toHaveBeenCalledOnce();
  });

  test("Warning logger reflects string to stdout", () => {
    warn("My warning");

    expect(consoleWarnMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("[!]"),
      "My warning"
    );
  });

  test("Error logger reflects string to stdout", () => {
    error("My error");

    expect(consoleErrorMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("[X]"),
      "My error"
    );
  });
});

describe("Loggers print multi-argument multi-type to stdout", () => {
  test("Success logger reflects string and number to stdout", () => {
    success("My success", -23);
    expect(consoleLogMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("[+]"),
      "My success",
      -23
    );
  });

  test("Info logger reflects string and number to stdout", () => {
    info("My information", -23);
    expect(consoleLogMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("[@]"),
      "My information",
      -23
    );
  });

  test("Debugger logger reflects string to stdout", () => {
    debug("My debug", -23);

    // TODO: fix this test
    expect(consoleLogMock).toHaveBeenCalledOnce();
  });

  test("Warning logger reflects string and number to stdout", () => {
    warn("My warning", -23);
    expect(consoleWarnMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("[!]"),
      "My warning",
      -23
    );
  });

  test("Error logger reflects string and number to stdout", () => {
    error("My error", -23);
    expect(consoleErrorMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("[X]"),
      "My error",
      -23
    );
  });
});
