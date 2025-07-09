import * as z from "zod/v4";
import { envConfigAdapter } from "./adapters/config/envAdapter";
import type {
  ConfigAdapter,
  PartialConfig,
} from "./adapters/config/genericConfigAdapter";
import { jsonAdapter } from "./adapters/config/jsonAdapter";
import { tsConfigAdapter } from "./adapters/config/tsAdapter";
import { debug } from "./utils/logger";

/**
 * The config schema, defined using Zod.
 * @see {@link https://zod.dev} for more information.
 */
export const configSchema = z.object({
  databaseUrl: z.string(),
  pepper: z
    .string()
    .max(32)
    .describe(
      "Password pepper is used to improve the security of password authentication"
    ),
  port: z.int().min(1).max(65535).default(1234),
  frontendUrl: z.url().default("http://localhost:3000"),
  backendUrl: z.url().default("http://localhost:1234"),
  githubClientId: z.string().optional(),
  githubClientSecret: z.string().optional(),
  githubOrgId: z.string().optional(),
  discordClientId: z.string().optional(),
  discordClientSecret: z.string().optional(),
  discordGuildId: z.string().optional(),
  discordRole: z.string().optional(),
  logRequests: z.boolean().default(true),
  emailHost: z.string().optional(),
  emailPort: z.int().min(1).max(65535).optional(),
  emailUsername: z.string().optional(),
  emailPassword: z.string().optional(),
  emailSecure: z.boolean().optional(),
  redisUrl: z.string(),
  oauthSignups: z
    .boolean()
    .optional()
    .describe(
      "Disabling oAuth sign-ups will prevent new users from registering with oAuth. This will not affect those who have been invited through e-mail. If enabled, sign-ups will still have to be in the group configured, such as Discord guild or GitHub organization."
    ),
  outOfBoxExperience: z
    .boolean()
    .default(true)
    .describe(
      "If it should show the out of box experience. This setting is managed by Permafrost, and you should NOT set it."
    ),
  applicationName: z
    .string()
    .optional()
    .default("Permafrost")
    .describe("The RP application name. Used for Passkeys."),
  applicationId: z
    .string()
    .optional()
    .default("localhost")
    .describe("The RP application ID. Used for Passkeys."),
});

/**
 * Elements from configSchema which should be editable by administrators.
 * Keep in mind any administrator is able to change this, not only super administrators.
 * This is intentionally a whitelist, not a blacklist.
 */
export const editableConfigElements = configSchema.pick({
  oauthSignups: true,
});

/**
 * Utility function used for simpler inferring of config types when using the TS configuration adapter.
 * Should only be used in a config.ts file provided by the deployer.
 * @param args Snowflake-Software Permafrost configuration object.
 * A reference of the configuration options is available on the documentation
 * @returns The arguments you passed in
 */
export function permafrostConfig(args: Partial<z.input<typeof configSchema>>) {
  return args;
}

export type ConfigShapeType = z.output<typeof configSchema>;
export const PartialConfigShape = configSchema.partial().shape;
const adapters: ConfigAdapter[] = [
  envConfigAdapter,
  tsConfigAdapter,
  jsonAdapter,
];

// Todo: re-implement PF_SUPPRESS_CONFIG_WARNING
export class ConfigManager {
  public _config: z.output<typeof configSchema> | null;

  constructor() {
    this._config = null;
  }

  async init() {
    for (const adapter of adapters) {
      if (adapter.init) await adapter.init();
    }

    // Variable is a hacky way to tell TypeScript we are looping keys
    let data: PartialConfig = {};
    for (const key in configSchema.shape) {
      for (const adapter of adapters) {
        const value = adapter.read(key as any);
        if (value !== null) {
          debug(`Loaded ${key} from ${adapter.name}`);
          data[key as keyof typeof configSchema.shape] = value as any;
          break;
        }
      }
    }

    const result = configSchema.safeParse(data);
    if (!result.success) {
      throw new Error("Failed to parse configuration: " + result.error);
    }

    this._config = result.data;
  }

  public get config() {
    return this._config!;
  }

  async set<K extends keyof z.output<typeof editableConfigElements>>(
    key: K,
    value: PartialConfig[K]
  ) {
    if (value === undefined) {
      return;
    }

    for (const adapter of adapters) {
      if (!adapter.write) continue;
      adapter.write(key, value);
      this._config![key] = value;
      break;
    }
  }
}
