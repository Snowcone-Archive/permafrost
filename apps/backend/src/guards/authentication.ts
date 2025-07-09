import type { Session, User } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";
import * as z from "zod/v4";
import { schemas } from "../plugins/state";
import { newAuthHandler } from "../utils/auth";
import { debug, warn } from "../utils/logger";

declare module "fastify" {
  interface FastifyRequest {
    user?: User;
    session?: Session;
  }
}

export async function authenticationGuard(
  req: FastifyRequest,
  res: FastifyReply
) {
  if (!req.headers.authorization)
    return res.status(401).send({
      error: {
        code: "Unauthorized",
        message: "Authorization is needed to request this information.",
      },
    });

  const token = String(req.headers.authorization).replace("Bearer ", "");
  const authHandler = await newAuthHandler(req.server);

  const tokenResult = await authHandler.checkToken(token);
  if (!tokenResult.success)
    return res.status(tokenResult.status || 400).send({
      error: {
        error: tokenResult.code,
      },
    });

  const { state } = tokenResult;
  if (state.type !== "session")
    return res.status(403).send({
      error: {
        code: "Forbidden",
        message: "Applications may not access this route.",
      },
    });

  if (state.user.flags.includes("Pending")) {
    return res.status(403).send({
      error: {
        code: "AccountPending",
        message: "Your account is pending activation.",
      },
    });
  }

  if (state.user.flags.includes("Disabled")) {
    return res.status(403).send({
      error: {
        code: "AccountDisabled",
        message: "Your account has been disabled.",
      },
    });
  }

  try {
    (async () => {
      const { prisma, state: serverState } = req.server;
      const session = await serverState.model("session").get(state.session.id);

      const commit = (
        currentState: z.infer<(typeof schemas)["session"]["zod"]>,
        lastSeen: Date
      ) => {
        serverState.model("session").set(state.session.id, {
          ...currentState,
          lastSeen: lastSeen,
        });

        prisma.session.update({
          where: { id: currentState.sessionId },
          data: { lastActivity: lastSeen },
        });
        debug("Updated session last seen", currentState.sessionId, lastSeen);
      };

      const now = new Date();

      if (!session) {
        // Create a new session store for this user

        const newSession = {
          userId: req.user!.id,
          sessionId: state.session.id,
          lastSeen: now,
        };

        commit(newSession, now);
        return;
      }

      // If session already exists, update it if it's been long enough

      if (now.getTime() - session.lastSeen.getTime() > 15 * 60 * 1000) {
        // 15 minutes
        commit(session, now);
      }
    })();
  } catch (e) {
    warn("Error while checking last seen:", e);
  }

  req.user = state.user;
  req.session = state.session;
}
