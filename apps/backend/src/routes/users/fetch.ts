import geoip from "fast-geoip";
import * as z from "zod/v4";
import * as auth from "../../utils/auth";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/users/:id",
  method: "GET",
  schema: {
    path: z.object({
      id: z.cuid2(),
    }),
  },
  async exec({ path }, req, res, fastify) {
    const { prisma } = fastify;
    const { id } = path;

    if (!req.headers.authorization)
      return res.status(401).send({
        error: {
          code: "Unauthorized",
          message: "Authorization is needed to get the requesting user.",
        },
      });

    const token = String(req.headers.authorization).replace("Bearer ", "");
    const authHandler = await auth.newAuthHandler(fastify);

    const tokenResult = await authHandler.checkToken(token);
    if (tokenResult.success == false)
      return res.status(tokenResult.status || 400).send({
        error: {
          code: tokenResult.code,
        },
      });

    const { state } = tokenResult;
    if (state.type === "unknown") return;

    if (
      id === "me" ||
      id === state.user.id ||
      state.user.permissions.includes("Administrator")
    ) {
      const userId = id === "me" ? state.user.id : id;

      if (state.type === "application") {
        const user = await prisma.user.findFirst({
          where: {
            id: userId,
          },
          select: {
            id: true,
            username: true,
            displayName: true,
            email: state.scopes.includes("email"),
            createdAt: true,
          },
        });

        if (!user) {
          return res.status(404).send({
            code: "NotFound",
            resource: "User",
            message: "This user has not been found.",
          });
        }

        return user;
      }

      const _user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          twoFactor: true,
          id: true,
          username: true,
          displayName: true,
          email: true,
          flags: true,
          permissions: true,
          createdAt: true,
          sessions: {
            select: {
              id: true,
              lastActivity: true,
              device: true,
              ipAddress: true,
              authenticationMethod: true,
            },
          },
          authorizations: {
            select: {
              id: true,
              application: {
                select: {
                  id: true,
                  name: true,
                  owner: {
                    select: {
                      id: true,
                      displayName: true,
                      username: true,
                      createdAt: true,
                    },
                  },
                },
              },
              scopes: true,
              createdAt: true,
            },
          },
          applications: {
            select: {
              id: true,
              name: true,
              createdAt: true,
            },
          },
        },
      });

      if (!_user)
        return res.status(404).send({
          error: {
            code: "NotFound",
            resource: "User",
            message: "This user has not been found.",
          },
        });

      const { twoFactor, ...user } = _user;

      return res.send({
        ...user,
        sessions: await Promise.all(
          user!.sessions.map(async (session) => {
            const info = await geoip.lookup(session.ipAddress);
            return {
              id: session.id,
              lastActivity: session.lastActivity,
              device: session.device,
              ipAddress: session.ipAddress,
              authenticationMethod: session.authenticationMethod,
              location:
                info && info.city && info.region && info.country
                  ? {
                      city: info?.city,
                      region: info?.region,
                      country: info?.country,
                    }
                  : undefined,
            };
          })
        ),
        twoFactorEnabled: twoFactor != undefined,
      });
    }

    if (state.type === "application") {
      return res.status(403).send({
        error: {
          code: "Forbidden",
          message: "Applications can only access their own data.",
        },
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    });

    if (!user)
      return res.status(404).send({
        error: {
          code: "NotFound",
          resource: "User",
          message: "This user has not been found.",
        },
      });

    res.send({ user });
  },
});
