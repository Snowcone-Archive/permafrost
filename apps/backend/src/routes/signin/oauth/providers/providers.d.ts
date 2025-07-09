import { User } from "@prisma/client";

export type MetadataFetchResponse =
  | {
      success: true;
      email: string;
      username: string;
      id: string;
      avatarUrl: string;
      user?: User | null;
    }
  | {
      success: false;
      code: number;
      redirectTo?: string;
      error: {
        code: string;
        message: string;
      };
    };

export type GetTokenReturnType =
  | {
      status: number;
      redirectTo?: string;
      error: { code: string; message: string };
    }
  | string;

export type GetTokenFunction = (
  code: string,
  redirectUri: string,
  fastify: FastifyInstance
) => Promise<GetTokenReturnType> | GetTokenReturnType;

export type GetMetadataFunction = (
  token: string,
  fastify: FastifyInstance
) => Promise<MetadataFetchResponse> | MetadataFetchResponse;

export type GetExistingUserFunction = (
  id: string,
  fastify: FastifyInstance
) => Promise<User | null> | User | null;

export type MembershipValidityCheckFunction = (
  token: string,
  fastify: FastifyInstance
) => Promise<boolean> | boolean;
