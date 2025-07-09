import type { AuthenticationResponse } from "@snowflake-software/permafrost-js";

export type BrowserStorageManager<T> = {
  set: <K extends keyof T>(field: K | string, value: T[K] | string) => void;
  get: <K extends keyof T>(
    field: K | string
  ) => T[K] extends undefined ? string | undefined : T[K];
  remove: (field: keyof T) => void;
  clear: () => void;
  keys: () => string[];
};

export type BrowserStorageSchema = {
  auth?: AuthenticationResponse;
  server?: {
    host: string;
    port?: number;
    secure?: boolean;
  };
  ["2fa"]?: {
    email: string;
    password: string;
  };
  backupCodes?: string[];
  shouldShowBackupCodes?: boolean;
};
