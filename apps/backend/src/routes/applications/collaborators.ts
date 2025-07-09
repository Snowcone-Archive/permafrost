import * as z from "zod/v4";
import { Guards } from "../..";
import { route } from "../../utils/routeBuilder";

export default route({
  path: "/applications/:id/collaborators",
  method: "POST",
  schema: {
    body: z.object({
      add: z.array(z.cuid2()).optional(),
      remove: z.array(z.cuid2()).optional(),
      set: z.array(z.cuid2()).optional(),
    }),
    path: z.object({
      id: z.cuid2(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.applicationParam,
    Guards.ownsApplication({ allowAdmin: false }),
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
    const initialCollaborators = await prisma.application.findFirst({
      where: {
        id,
      },
      select: {
        collaborators: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Get the updated collaborator list
    let collaboratorList: string[] = initialCollaborators!.collaborators.map(
      (collaborator) => collaborator.id
    );

    if (body.set) {
      collaboratorList = body.set;
    } else {
      if (body.add) collaboratorList.push(...body.add);

      if (body.remove !== undefined) {
        collaboratorList = collaboratorList.filter(
          (collaborator) => !body.remove!.includes(collaborator)
        );
      }
    }

    // Remove duplicates
    collaboratorList = collaboratorList.filter(
      (value, index, self) => self.indexOf(value) === index
    );

    // Get the users
    const users = await Promise.all(
      collaboratorList.map(async (collaborator) => {
        return await prisma.user.findFirst({
          where: {
            id: collaborator,
          },
        });
      })
    );

    // If one doesn't exist, return an error
    if (users.some((user) => !user))
      return res.status(404).send({
        error: {
          code: "InexistentUser",
          message: "One or more users do not exist.",
        },
      });

    // If one requires email verification, return an error
    if (
      users.some((user) => user?.flags.includes("RequiresEmailVerification"))
    ) {
      return res.status(403).send({
        error: {
          code: "Forbidden",
          message:
            "One or more of the requested users has not verified their email.",
        },
      });
    }

    // Updated
    const updatedApplication = await prisma.application.update({
      where: {
        id,
      },
      data: {
        collaborators: {
          set: users.map((user) => ({ id: user!.id })),
        },
      },
      select: {
        collaborators: {
          select: {
            id: true,
            username: true,
            displayName: true,
            createdAt: true,
          },
        },
      },
    });

    initialCollaborators!.collaborators.forEach(async (collaborator) => {
      if (
        !updatedApplication.collaborators.some(
          (newCollaborator) => newCollaborator.id === collaborator.id
        )
      ) {
        await req.auditLogEntry({
          affectedApplication: req.application!,
          action: "collaborator-removed",
          description: `@${req.user!.username} removed @${
            collaborator.username
          } as a collaborator.`,
        });
      }
    });

    updatedApplication.collaborators.forEach(async (collaborator) => {
      if (
        !initialCollaborators!.collaborators.some(
          (oldCollaborator) => oldCollaborator.id === collaborator.id
        )
      ) {
        await req.auditLogEntry({
          affectedApplication: req.application!,
          action: "collaborator-added",
          description: `@${req.user!.username} added @${
            collaborator.username
          } as a collaborator.`,
        });
      }
    });

    return res.status(200).send({
      collaborators: updatedApplication.collaborators,
    });
  },
});
