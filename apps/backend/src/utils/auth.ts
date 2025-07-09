import { type User } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";
import { createPublicKey } from "node:crypto";
import { join } from "path";
import { UAParser } from "ua-parser-js";
import type {
  ApplicationTokenPayload,
  HostInfo,
  SessionTokenPayload,
  TokenState,
} from "../types";
import { debug } from "./logger";

async function getKey(path: string) {
  const file = Bun.file(join(__dirname, "../../", path));
  if (file.size <= 0) {
    throw new Error(`Missing ${path}`);
  }
  return Buffer.from(await file.arrayBuffer());
}

const usersPrivateKey = await getKey("users.pem");
const applicationsPrivateKey = await getKey("applications_private.pem");
const applicationsPublicKey = await getKey("applications_public.pem");
export const applicationsJwkData = createPublicKey(
  applicationsPublicKey
).export({ format: "jwk" });

export async function createApplicationJWT(opts: {
  issuedBy: string;
  applicationId: string;
  userId: string;
  sessionId: string;
}) {
  const token = jwt.sign(
    {
      type: "application",
      iat: Date.now(),
      aud: opts.applicationId,
      iss: opts.issuedBy,
      exp: DateTime.now().plus({ months: 3 }).toMillis(),
      sub: opts.userId,
      parent: opts.applicationId,
      data: {
        user: opts.userId,
        session: opts.sessionId,
      },
    } satisfies ApplicationTokenPayload,
    applicationsPrivateKey,
    {
      algorithm: "RS256",
    }
  );

  return token;
}

export async function createSessionJWT(opts: {
  issuedBy: string;
  userId: string;
  host: HostInfo;
}) {
  const token = jwt.sign(
    {
      type: "session",
      iat: Date.now(),
      iss: opts.issuedBy,
      exp: DateTime.now().plus({ months: 3 }).toMillis(),
      id: opts.userId,
      data: opts.host,
    } satisfies SessionTokenPayload,
    usersPrivateKey
  );

  return token;
}

export async function verifyJWT<T extends "application" | "user">(
  type: T,
  token: string
): Promise<
  | (T extends "application"
      ? ApplicationTokenPayload
      : T extends "user"
        ? SessionTokenPayload
        : never)
  | null
> {
  try {
    const rawPayload = jwt.verify(
      token,
      type === "application" ? applicationsPublicKey : usersPrivateKey,
      {
        algorithms: ["HS256", "RS256"],
      }
    );
    return rawPayload || JSON.parse(rawPayload);
  } catch (e) {
    debug("Unable to parse JWT", token, e);
    return null;
  }
}

export const newAuthHandler = async (fastify: FastifyInstance) => {
  const startSession = async (
    user: User,
    host: HostInfo,
    issuer: string,
    authorizationMethod?: "Email" | "GitHub" | "Discord" | "Passkey"
  ) => {
    const token = await createSessionJWT({
      issuedBy: issuer,
      userId: user.id,
      host,
    });

    const session = await fastify.prisma.session.create({
      data: {
        device: host.device,
        ipAddress: host.address,
        token,
        userId: user.id,
        authenticationMethod: authorizationMethod,
      },
    });

    fastify.metrics.sessions.inc();

    return session;
  };

  const checkSession = async (token: string) => {
    const session = await fastify.prisma.session.findFirst({
      where: {
        token,
      },
    });

    if (!session)
      return { success: false, code: "InexistentSession", status: 404 };

    const payload = await verifyJWT("user", token);
    if (!payload)
      return { success: false, code: "InvalidSession", status: 400 };

    if (payload.id !== session.userId)
      return { success: false, code: "InvalidSessionTarget", status: 400 };

    const user = await fastify.prisma.user.findFirst({
      where: {
        sessions: {
          some: {
            token,
          },
        },
      },
    });

    if (!user)
      return { success: false, code: "InexistentSessionTarget", status: 404 };
    return { success: true, user, session };
  };

  const checkToken = async (
    token: string
  ): Promise<
    | { success: false; code: string; status: number }
    | { success: true; state: TokenState }
  > => {
    let tokenState: TokenState | undefined;

    const session = await fastify.prisma.session.findFirst({
      where: {
        token,
      },
      include: {
        user: true,
      },
    });

    if (session) {
      tokenState = {
        type: "session",
        user: session.user,
        session,
      };

      const payload = await verifyJWT("user", token);
      if (!payload)
        return { success: false, code: "InvalidSession", status: 400 };

      if (payload.id !== session.userId)
        return {
          success: false,
          code: "InvalidSessionTarget",
          status: 400,
        };
    }

    if (tokenState == undefined) {
      const authorization = await fastify.prisma.authorization.findFirst({
        where: {
          token,
        },
        include: {
          user: true,
          application: true,
        },
      });

      if (authorization) {
        tokenState = {
          type: "application",
          user: authorization.user,
          application: authorization.application,
          scopes: authorization.scopes,
        };

        const payload = await verifyJWT("application", token);
        if (!payload)
          return { success: false, code: "InvalidSession", status: 400 };

        if (
          payload.parent !== authorization.applicationId &&
          payload.data.user !== authorization.userId
        )
          return {
            success: false,
            code: "InvalidSessionTarget",
            status: 400,
          };
      }
    }

    if (!tokenState)
      return { success: false, code: "UnknownAccessToken", status: 404 };
    return { success: true, state: tokenState };
  };

  return { startSession, checkSession, checkToken };
};

export function getDeviceType(userAgentString?: string) {
  if (userAgentString?.startsWith("Permafrost/")) return "sdk";

  const ua = UAParser(userAgentString);
  const uaDevice = ua.device;
  const uaOS = ua.os;

  if (uaDevice.type === undefined && uaOS.name === undefined) return "unknown";

  switch (uaDevice.type) {
    case "mobile":
    case "tablet":
      switch (uaDevice.vendor) {
        case "Apple":
          return "ios";
        default:
          return "android";
      }

    case "console":
      switch (uaDevice.vendor) {
        case "Microsoft":
          return "windows";
        default:
          return "generic";
      }

    default:
      if (uaOS.name?.startsWith("Windows")) return "windows";

      switch (uaOS.name) {
        case "macOS":
          return "mac";

        case "Chrome OS":
          return "chromeos";

        case "Arch":
        case "CentOS":
        case "Fedora":
        case "Debian":
        case "Gentoo":
        case "GNU":
        case "Linux":
        case "Mint":
        case "SUSE":
        case "Ubuntu":
          return "linux";
      }

      return "generic";
  }
}

export async function hashPassword(password: string) {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });
}

export async function verifyPassword(hash: string, password: string) {
  return await Bun.password.verify(password, hash, "bcrypt");
}
