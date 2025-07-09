import { fileTypeFromBuffer } from "file-type";
import { readFile } from "fs/promises";
import { join } from "path";
import * as z from "zod/v4";
import { Guards } from "../..";
import { warn } from "../../utils/logger";
import { route } from "../../utils/routeBuilder";

export const DEFAULT_APPLICATION_ICON = await readFile(
  join(__dirname, "..", "..", "static", "defaults", "appIcon.png")
);

export const ALLOWED_IMAGE_UPLOAD_TYPES = [
  "image/png",
  "image/apng",
  "image/gif",
  "image/jpeg",
];

export const getIcon = route({
  path: "/applications/:id/icon",
  method: "GET",
  schema: {
    path: z.object({
      id: z.string(),
    }),
  },
  async exec({ path: { id } }, req, res, fastify) {
    const { prisma, storage } = fastify;

    const application = await prisma.application.findFirst({
      where: {
        id,
      },
    });

    if (!application) return res.status(404).sendFile("defaults/missing.png");

    const bucket = await storage.bucket("applications");
    const handle = await bucket.file(`${id}`);
    let content = await handle?.read();

    if (!handle || !content?.length) {
      content = DEFAULT_APPLICATION_ICON;
    }

    try {
      const type = await fileTypeFromBuffer(content);
      res.header("Content-Type", type!.mime);
    } catch (err) {
      warn("Failed to detect type for avatar file: ", err);
    }

    return content;
  },
});

export const updateIcon = route({
  path: "/applications/:id/icon",
  method: "POST",
  schema: {
    path: z.object({
      id: z.string(),
    }),
    body: z.object({
      file: z.any(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.applicationParam,
    Guards.collaborator({ allowAdmin: false }),
  ],
  async exec({ path: { id } }, req, res, fastify) {
    const { storage } = fastify;

    const bucket = await storage.bucket("applications");
    const file = (req.body as any).file as {
      data: Buffer;
      mimetype: string;
    };

    if (!file || !file.data)
      return res.status(400).send({
        error: {
          code: "InvalidPayload",
          field: "file",
          message: "You need to provide file data.",
        },
      });

    try {
      const type = await fileTypeFromBuffer(file.data);

      if (!ALLOWED_IMAGE_UPLOAD_TYPES.includes(type!.mime))
        return res.status(400).send({
          error: {
            code: "TypeNotAllowed",
            message: `Allowed types: ${ALLOWED_IMAGE_UPLOAD_TYPES.join(", ")}.`,
          },
        });

      const handle = await bucket.file(`${id}`);
      await handle!.write(file.data);

      await req.auditLogEntry({
        affectedApplication: req.application!,
        action: "icon-changed",
        description: `@${req.user!.username} changed the application icon.`,
      });

      res.status(200).send({
        success: true,
      });
      return;
    } catch (err) {
      warn("File upload receive failed:", err);

      return res.status(400).send({
        error: {
          code: "InvalidPayload",
          field: "file",
        },
      });
    }
  },
});

export const deleteIcon = route({
  path: "/applications/:id/icon",
  method: "DELETE",
  schema: {
    path: z.object({
      id: z.string(),
    }),
    body: z.object({
      file: z.any(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.applicationParam,
    Guards.collaborator({ allowAdmin: "admin" }),
  ],
  async exec({ path: { id } }, req, res, fastify) {
    const { storage } = fastify;
    const bucket = await storage.bucket("applications");

    const handle = await bucket.file(`${id}`);
    if (handle) await handle.delete();

    await req.auditLogEntry({
      affectedApplication: req.application!,
      action: "icon-removed",
      description: `@${req.user!.username} removed the application icon.`,
    });

    res.status(200).send({
      success: true,
    });
  },
});
