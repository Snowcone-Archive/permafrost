"use client";

import type {
  BrowserStorageManager,
  BrowserStorageSchema,
} from "@/types/general";

const namespace = "permafrost";

export const browserStorage = (
  sessionOnly?: boolean
): BrowserStorageManager<BrowserStorageSchema> | undefined => {
  if (typeof window === "undefined" || !("localStorage" in window))
    return undefined;
  let storage: Storage = sessionOnly ? sessionStorage : localStorage;

  return {
    get: (field) => {
      const raw = storage.getItem(`${namespace}:${btoa(field as string)}`);
      if (!raw) return undefined;

      const [type, value] = atob(raw).split("|");

      switch (type) {
        case "boolean":
          return Boolean(value);
        case "number":
          return Number(value);
        case "string":
          return String(value);
        case "object":
          return JSON.parse(String(value));
        default:
          return value;
      }
    },
    set: (field, value) => {
      let val: string;
      switch (typeof value) {
        case "object":
          val = JSON.stringify(value);
          break;
        default:
          val = String(value);
          break;
      }

      storage.setItem(
        `${namespace}:${btoa(field as string)}`,
        btoa(`${typeof value}|${val}`)
      );
    },
    remove: (field) => {
      storage.removeItem(`${namespace}:${btoa(field as string)}`);
    },
    clear: () => storage.clear(),
    keys: () => {
      const keys = [];
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (!key || !key.startsWith(namespace)) continue;

        keys.push(atob(key.split(":")[1]));
      }

      return keys;
    },
  } as BrowserStorageManager<BrowserStorageSchema>;
};
