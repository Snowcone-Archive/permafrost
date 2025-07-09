import { fileTypeFromBuffer } from "file-type";
import { readFile } from "fs/promises";
import { join } from "path";
import * as z from "zod/v4";
import { Guards } from "../..";
import { DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE } from "../../guards/hasFlag";
import { warn } from "../../utils/logger";
import { route } from "../../utils/routeBuilder";

export const getAvatar = route({
  path: "/users/:id/avatar",
  method: "GET",
  schema: {
    path: z.object({
      id: z.string(),
    }),
  },
  async exec({ body, path }, req, res, fastify) {
    const { prisma, storage } = fastify;
    const { id } = path;
    const bucket = await storage.bucket("avatars");

    const userCount = await prisma.user.count({
      where: {
        id,
      },
    });

    if (userCount <= 0) return res.status(404).sendFile("defaults/missing.png");

    const handle = await bucket.file(`${id}`);

    if (handle) {
      let content = await handle.read();

      if (!handle || !content.length) {
        content = await readFile(
          join(__dirname, "..", "..", "static", "defaults", "avatar.png")
        );
      }

      try {
        const type = await fileTypeFromBuffer(content);
        res.header("Content-Type", type!.mime);
      } catch (err) {
        warn("Failed to detect type for avatar file: ", err);
      }

      return content;
    }
  },
});

export const updateAvatar = route({
  path: "/users/me/avatar",
  method: "POST",
  schema: {
    body: z.object({
      file: z.any(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.missingFlag(
      "RequiresEmailVerification",
      DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE
    ),
  ],
  async exec({ body }, req, res, { storage }) {
    const bucket = await storage.bucket("avatars");
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
      const allowedTypes = [
        "image/png",
        "image/apng",
        "image/gif",
        "image/jpeg",
      ];

      if (!allowedTypes.some((t) => t === type!.mime))
        return res.status(400).send({
          error: {
            code: "TypeNotAllowed",
            message: `Allowed types: ${allowedTypes.join(", ")}.`,
          },
        });

      const handle = await bucket.file(`${req.user!.id}`);
      await handle!.write(file.data);

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

export const deleteAvatar = route({
  path: "/users/:id/avatar",
  method: "DELETE",
  schema: {
    path: z.object({
      id: z.string(),
    }),
  },
  guards: [
    Guards.authenticated,
    Guards.missingFlag(
      "RequiresEmailVerification",
      DEFAULT_EMAIL_NOT_VERIFIED_MESSAGE
    ),
  ],
  async exec({ path }, req, res, { storage }) {
    const bucket = await storage.bucket("avatars");
    const handle = await bucket.file(
      `${path.id === "me" ? req.user!.id : path.id}`
    );

    if (path.id !== "me" && !req.user?.permissions.includes("Administrator"))
      return res.status(403).send({
        error: {
          code: "Forbidden",
          message: "You are not allowed to delete this avatar.",
        },
      });

    if (handle) await handle.delete();

    return {
      success: true,
    };
  },
});
