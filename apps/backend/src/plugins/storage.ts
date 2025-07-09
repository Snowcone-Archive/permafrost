import fp from "fastify-plugin";
import { mkdir, readFile, stat, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { debug, success } from "../utils/logger";

declare module "fastify" {
  interface FastifyInstance {
    storage: typeof storageManager;
  }
}

export const storagePlugin = fp(async (fastify, options) => {
  fastify.decorate("storage", storageManager);
  success("Initialised storage");
});

const storagePath = join("storage");
const getPathFor = (namespace: string) => join(storagePath, namespace);
const storageManager = {
  async checkStat(path: string, type: "directory" | "file" | "symlink") {
    try {
      const res = await stat(path);
      switch (type) {
        case "directory":
          return res.isDirectory();
        case "file":
          return res.isFile();
        case "symlink":
          return res.isSymbolicLink();
        default:
          return null;
      }
    } catch (err) {
      debug(
        `Stat check failed, ${type} possibly doesn't exist or program has no read access: ${path}`
      );
      return null;
    }
  },

  async bucket(namespace: string) {
    const bucketPath = getPathFor(namespace);
    if ((await this.checkStat(bucketPath, "directory")) === null)
      await mkdir(bucketPath, { recursive: true });

    return {
      file: async (name: string) => {
        const filePath = join(bucketPath, name);
        const statCheck = await this.checkStat(filePath, "file");

        if (statCheck === false) return null;
        if (statCheck === null) await writeFile(filePath, "");

        return {
          read: async () => readFile(filePath),
          write: async (data: string | Buffer) =>
            await writeFile(filePath, data),
          delete: async () => await unlink(filePath),
          info: async () => {
            try {
              const info = await stat(filePath);
              if (!info.isFile()) return null;

              return {
                size: info.size,
                accessed: info.atime,
                modified: info.mtime,
                created: info.ctime,
              };
            } catch (_) {
              return null;
            }
          },
        };
      },
      delete: async () => await unlink(bucketPath),
      info: async () => {
        try {
          const info = await stat(bucketPath);
          if (!info.isDirectory()) return null;

          return {
            size: info.size,
            accessed: info.atime,
            modified: info.mtime,
            created: info.ctime,
          };
        } catch (_) {
          return null;
        }
      },
    };
  },
};
