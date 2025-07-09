import { expect, test } from "vitest";
import { route } from "./routeBuilder";

test("Route builder reflects inputted route", () => {
  const input = {
    path: "/my-route",
    method: "GET",
    async exec() {},
  };

  expect(route(input)).toEqual(input);
});
