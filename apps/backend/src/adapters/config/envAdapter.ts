import { configSchema } from "../../config";
import { debug, warn } from "../../utils/logger";
import type { ConfigAdapter, PartialConfig } from "./genericConfigAdapter";

let data: PartialConfig;

export const envConfigAdapter = {
  name: "env",

  async init() {
    const result = await configSchema.partial().safeParseAsync(parseEnv());

    if (result.success && result.data) {
      data = result.data;
      debug("Successfully parsed environment variables for configuration");
    } else {
      warn("Failed to parse data from environment variables: ", result.error);
    }
  },

  read<K extends keyof PartialConfig>(key: K) {
    if (data && data[key]) {
      return data[key] as PartialConfig[K];
    }

    return null;
  },
} satisfies ConfigAdapter;

function parseEnv(): Object {
  let data: PartialConfig = {};

  for (const key in configSchema.shape) {
    const value = Bun.env[convertConfigName(key)];

    if (value) {
      data[key as keyof typeof configSchema.shape] = value as any;
    }
  }

  return data;
}

function convertConfigName(input: string): string {
  return `PF_` + input.replace(/[A-Z]/g, (v) => `_${v}`).toUpperCase();
}
