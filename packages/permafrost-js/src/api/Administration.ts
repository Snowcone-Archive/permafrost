import { Permafrost } from "./Permafrost";

export type AuditLogEntryBase = {
  id: string;
  executingUser: {
    id: string;
    username: string;
  };
  action: string;
  type: string;
  description: string;
  details: any;
  createdAt: string;
};

export type UserAuditLogEntry = AuditLogEntryBase & {
  type: "user";
  affectedUser: {
    id: string;
    username: string;
  };
};

export type ApplicationAuditLogEntry = AuditLogEntryBase & {
  type: "application";
  affectedApplication: {
    id: string;
    name: string;
  };
};

export type SystemAuditLogEntry = AuditLogEntryBase & {
  type: "system";
};

export type AuditLogListResponse = {
  total: number;
  entries: (
    | UserAuditLogEntry
    | ApplicationAuditLogEntry
    | SystemAuditLogEntry
  )[];
};

export type AuditLogOptions = {
  start?: Date;
  end?: Date;
  sortBy?: "newest" | "oldest";
  index?: number;
  take?: number;
  executingUser?: string;
};

export type Configuration = {
  oauthSignups: boolean;
};

export type PartialConfiguration = Partial<Configuration>;

export class Administration {
  public permafrost: Permafrost;

  constructor(permafrost: Permafrost) {
    this.permafrost = permafrost;
  }

  /**
   * Gets the audit log.
   * @param options
   * @returns
   */
  public getAuditLog(auditLogOptions?: AuditLogOptions, options?: RequestInit) {
    if (auditLogOptions) {
      Object.keys(auditLogOptions).forEach((key) =>
        (auditLogOptions as any)[key] === undefined
          ? delete (auditLogOptions as any)[key]
          : {}
      );
    }
    const auditLogOptionsRecord = auditLogOptions as Record<string, any>;

    return this.permafrost.makeRequest<AuditLogListResponse>(
      `/audit-log?` + new URLSearchParams(auditLogOptionsRecord).toString(),
      options
    );
  }

  public getConfiguration(options?: RequestInit) {
    return this.permafrost.makeRequest<Configuration>(
      `/admin/configuration`,
      options
    );
  }

  public updateConfiguration(
    updates: PartialConfiguration,
    options?: RequestInit
  ) {
    return this.permafrost.makeRequest<Configuration>(`/admin/configuration`, {
      method: "PATCH",
      body: JSON.stringify(updates),
      ...options,
    });
  }

  public purgeAuditLog(body: { before: string }, options?: RequestInit) {
    return this.permafrost.makeRequest<void>(`/audit-log/purge`, {
      method: "DELETE",
      body: JSON.stringify(body),
      ...options,
    });
  }
}
