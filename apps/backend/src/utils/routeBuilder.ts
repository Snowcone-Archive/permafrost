import type { RouteSpecification } from "../types";

export function route<A, B, C>(spec: RouteSpecification<A, B, C>) {
  return spec;
}
