import { join } from "path";
import { configSchema } from "../../config";
import { debug, warn } from "../../utils/logger";
import type { ConfigAdapter, PartialConfig } from "./genericConfigAdapter";

let data: { [key: string]: any } = {};

export const tsConfigAdapter = {
  name: "config.ts",

  async init() {
    const filePath = join(__dirname, "../../../config.ts");
    debug(`Importing ${filePath}`);

    try {
      const file = await import(filePath);
      data = file.default;
      if (!data) throw new Error("No default export found!");
      debug("Successfully found default export for config.ts");
    } catch (e) {
      if (Bun.env.PF_SUPPRESS_CONFIG_WARNING === undefined) {
        warn("Error while importing config.ts");
        warn(e);
        warn(
          "Configuration will be loaded exclusively from environment variables. To suppress this warning, set the environment variable PF_SUPPRESS_CONFIG_WARNING=1. (https://permafrost.snowflake.blue/config#via-environment-variables)"
        );
      }
    }

    const result = await configSchema.partial().safeParseAsync(data);

    if (result.success) {
      data = result.data;
    } else {
      warn("Failed to parse data from config.ts: ", result.error);
    }
  },

  read<K extends keyof PartialConfig>(key: K) {
    if (data[key]) {
      return data[key] as PartialConfig[K];
    }

    return null;
  },
} satisfies ConfigAdapter;
