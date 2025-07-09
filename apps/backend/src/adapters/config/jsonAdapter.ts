import { JSONFilePreset } from "lowdb/node";
import type { ConfigAdapter, PartialConfig } from "./genericConfigAdapter";

const db = await JSONFilePreset<PartialConfig>("config.json", {});

export const jsonAdapter = {
  name: "config.json",

  read<K extends keyof PartialConfig>(key: K): PartialConfig[K] | null {
    return db.data[key] ?? null;
  },

  async write<K extends keyof PartialConfig>(
    key: K,
    value: PartialConfig[K]
  ): Promise<void> {
    db.data[key] = value;
    await db.write();
  },
} satisfies ConfigAdapter;
