import { Guards } from "../../";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/users",
  method: "GET",
  guards: [Guards.authenticated, Guards.hasPermission("Administrator")],
  async exec(input, req, res, fastify) {
    const { prisma } = fastify;

    const allUsers = await prisma.user.findMany({
      select: {
        _count: {
          select: {
            authorizations: true,
            sessions: true,
          },
        },
        id: true,
        email: true,
        username: true,
        displayName: true,
        permissions: true,
        twoFactor: true,
        applications: {
          select: {
            id: true,
            ownerId: true,
            name: true,
            _count: {
              select: {
                authorizations: true,
              },
            },
            createdAt: true,
          },
        },
        flags: true,
        createdAt: true,
      },
    });

    return {
      users: await Promise.all(
        allUsers.map(({ _count, twoFactor, applications, ...user }) => {
          return {
            ..._count,
            ...user,
            applications: applications.map((app) => ({
              ...app,
              authorizations: app._count.authorizations,
            })),
            twoFactorEnabled: twoFactor !== null,
          };
        })
      ),
    };
  },
});
