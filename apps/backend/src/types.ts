import {
  type Application,
  AuthorizationScopes,
  PrismaClient,
  type Session,
  type User,
} from "@prisma/client";
import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  HTTPMethods,
} from "fastify";
import type { ZodSchema } from "zod/v4";
import type { StateType } from "./plugins/state";

//////////////////
// Route things //
//////////////////

export type RouteExecutor = (
  req: FastifyRequest,
  res: FastifyReply,
  mod: RouteHandlerModules
) => Promise<void>;

export type RouteHandlerModules = {
  prisma: PrismaClient;
  state: StateType;
};

export type RouteSpecification<bodyT, pathT, queryT> = {
  path: string | string[];
  method: HTTPMethods;
  guards?: ((req: FastifyRequest, res: FastifyReply) => Promise<void> | void)[];
  rateLimit?: number;
  schema?: {
    body?: ZodSchema<bodyT>;
    path?: ZodSchema<pathT>;
    query?: ZodSchema<queryT>;
  };
  exec: RouteInvocation<bodyT, pathT, queryT>;
};

export type RouteInvocation<bodyT, pathT, queryT> = (
  inputs: {
    body: bodyT;
    path: pathT;
    query: queryT;
  },
  req: FastifyRequest,
  res: FastifyReply,
  fastify: FastifyInstance & {
    state: StateType;
    prisma: PrismaClient;
  }
) => Promise<void | object>;

export enum AuthLevel {
  InactiveAccount,
  ActiveAccount,
  Administrator,
}

export type UserPermission = "CreateApplication";

type UnknownTokenState = {
  type: "unknown";
};

type SessionTokenState = {
  type: "session";
  user: User;
  session: Session;
};

type ApplicationTokenState = {
  type: "application";
  user: User;
  application: Application;
  scopes: AuthorizationScopes[];
};

export type TokenState =
  | UnknownTokenState
  | SessionTokenState
  | ApplicationTokenState;

export type HostInfo = {
  address: string;
  // location: {
  //   city: string;
  //   region: string;
  //   country: string;
  // };
  device: string;
};

export type ApplicationTokenPayload = {
  type: "application";
  iat: number;
  aud: string;
  iss: string;
  exp: number;
  sub: string;
  parent: string;
  data: {
    user: string;
    session: string;
  };
};

export type SessionTokenPayload = {
  type: "session";
  iat: number;
  iss: string;
  exp: number;
  id: string;
  data: HostInfo;
};

export type CamelToSnakeCase<S extends string> =
  S extends `${infer T}${infer U}`
    ? `${T extends Capitalize<T>
        ? "_"
        : ""}${Uppercase<T>}${CamelToSnakeCase<U>}`
    : S;

export type CamelToSnakeCaseNested<T> = T extends object
  ? {
      [K in keyof T as CamelToSnakeCase<K & string>]: CamelToSnakeCaseNested<
        T[K]
      >;
    }
  : T;

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${Lowercase<T>}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

type SnakeToCamelCaseNested<T> = T extends object
  ? {
      [K in keyof T as SnakeToCamelCase<K & string>]: SnakeToCamelCaseNested<
        T[K]
      >;
    }
  : T;

export type Concat<T extends string[]> = T extends [
  infer F extends string,
  ...infer R extends string[],
]
  ? `${F}${Concat<R>}`
  : "";
