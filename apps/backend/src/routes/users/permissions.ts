import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

const permissionEnum = z.enum([
  "SuperAdministrator",
  "Administrator",
  "CreateApplication",
]);

export default route({
  path: "/users/:id/permissions",
  method: "POST",
  schema: {
    body: z.object({
      add: z.array(permissionEnum).optional(),
      remove: z.array(permissionEnum).optional(),
      set: z.array(permissionEnum).optional(),
    }),
    path: z.object({
      id: z.cuid2(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.hasPermission("Administrator"),
    Guards.sudo,
  ],
  async exec({ body, path: { id } }, req, res, fastify) {
    const { prisma } = fastify;

    if ((body.set && body.remove) || (body.set && body.add)) {
      return res.status(400).send({
        error: {
          code: "InvalidRequest",
          message: "Cannot set and add/remove collaborators at the same time.",
        },
      });
    }

    if (!body.set && !body.add && !body.remove) {
      return res.status(400).send({
        error: {
          code: "InvalidRequest",
          message: "You must provide a set, add, or remove key.",
        },
      });
    }

    if (body.add?.length === 0 || body.remove?.length === 0) {
      return res.status(400).send({
        error: {
          code: "InvalidRequest",
          message: "You must provide at least one collaborator.",
        },
      });
    }

    // Get initial collaborators
    const initialPermissions = (
      await prisma.user.findFirst({
        where: {
          id,
        },
        select: {
          permissions: true,
        },
      })
    )?.permissions!;

    // Get the updated collaborator list
    let permissions: string[] = [...initialPermissions];

    if (body.set) {
      // Adding
      if (
        body.set.includes("Administrator") &&
        !initialPermissions.includes("Administrator") &&
        !req.user!.permissions.includes("SuperAdministrator")
      ) {
        return res.status(403).send({
          error: {
            code: "Forbidden",
            message:
              "You do not have permission to add the Administrator permission.",
          },
        });
      }

      if (
        body.set.includes("SuperAdministrator") &&
        !initialPermissions.includes("SuperAdministrator") &&
        !req.user!.permissions.includes("SuperAdministrator")
      ) {
        return res.status(403).send({
          error: {
            code: "Forbidden",
            message:
              "You do not have permission to add the SuperAdministrator permission.",
          },
        });
      }

      // Removing
      if (
        !body.set.includes("Administrator") &&
        initialPermissions.includes("Administrator") &&
        !req.user!.permissions.includes("SuperAdministrator")
      ) {
        return res.status(403).send({
          error: {
            code: "Forbidden",
            message:
              "You do not have permission to remove the Administrator permission.",
          },
        });
      }

      if (
        !body.set.includes("SuperAdministrator") &&
        initialPermissions.includes("SuperAdministrator") &&
        !req.user!.permissions.includes("SuperAdministrator")
      ) {
        return res.status(403).send({
          error: {
            code: "Forbidden",
            message:
              "You do not have permission to remove the SuperAdministrator permission.",
          },
        });
      }

      permissions = body.set;
    } else {
      if (
        body.add?.includes("Administrator") &&
        !req.user!.permissions.includes("SuperAdministrator")
      ) {
        return res.status(403).send({
          error: {
            code: "Forbidden",
            message:
              "You do not have permission to add the Administrator permission.",
          },
        });
      }

      if (
        body.add?.includes("SuperAdministrator") &&
        !req.user!.permissions.includes("SuperAdministrator")
      ) {
        return res.status(403).send({
          error: {
            code: "Forbidden",
            message:
              "You do not have permission to add the SuperAdministrator permission.",
          },
        });
      }

      //

      if (
        body.remove?.includes("Administrator") &&
        !req.user!.permissions.includes("SuperAdministrator")
      ) {
        return res.status(403).send({
          error: {
            code: "Forbidden",
            message:
              "You do not have permission to remove the Administrator permission.",
          },
        });
      }

      if (
        body.remove?.includes("SuperAdministrator") &&
        !req.user!.permissions.includes("SuperAdministrator")
      ) {
        return res.status(403).send({
          error: {
            code: "Forbidden",
            message:
              "You do not have permission to remove the SuperAdministrator permission.",
          },
        });
      }

      //

      if (body.add) permissions.push(...body.add);

      if (body.remove !== undefined) {
        permissions = permissions.filter(
          (permission) => !body.remove!.includes(permission as any)
        );
      }
    }

    // Remove duplicates
    permissions = permissions.filter(
      (value, index, self) => self.indexOf(value) === index
    );

    // Updated
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        permissions: {
          set: permissions as any[],
        },
      },
      select: {
        username: true,
        id: true,
        permissions: true,
      },
    });

    initialPermissions!.forEach(async (initialPermission) => {
      if (
        !updatedUser.permissions.some(
          (newPermission) => newPermission === initialPermission
        )
      ) {
        await req.auditLogEntry({
          affectedUser: updatedUser,
          action: "permission-removed",
          description: `@${
            req.user!.username
          } disallowed redirects to ${initialPermission}.`,
        });
      }
    });

    updatedUser.permissions.forEach(async (newPermission) => {
      if (
        !initialPermissions!.some(
          (oldPermission) => oldPermission === newPermission
        )
      ) {
        await req.auditLogEntry({
          affectedUser: updatedUser,
          action: "permission-added",
          description: `@${req.user!.username} added the ${newPermission}.`,
        });
      }
    });

    return res.status(200).send({
      permissions: updatedUser.permissions,
    });
  },
});
