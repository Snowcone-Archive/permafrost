import * as z from "zod/v4";
import { configSchema } from "../../config";

export type PartialConfig = Partial<z.output<typeof configSchema>>;

export interface ConfigAdapter {
  name: string;

  init?: () => Promise<void>;

  read<K extends keyof PartialConfig>(key: K): PartialConfig[K] | null;

  write?<K extends keyof PartialConfig>(key: K, value: PartialConfig[K]): void;
}
