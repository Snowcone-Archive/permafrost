import { type ErrPromiseType } from "../ErrPromise";
import type { Passkey } from "./Authentication";
import { Permafrost } from "./Permafrost";
import type {
  AccountFlags,
  AccountPermissions,
  AuthorizationScopes,
  Error,
  GenericSuccess,
  Session,
  UserPrimitive,
} from "./Types";

export type CheckUsernameResponse = {
  taken: boolean;
};

export type GetUserResponse = {
  email: string;
  flags: AccountFlags[];
  permissions: AccountPermissions[];
  createdAt: string;
  sessions: {
    id: string;
    lastActivity: string;
    device:
      | "ios"
      | "android"
      | "windows"
      | "mac"
      | "linux"
      | "sdk"
      | "generic"
      | "unknown"
      | string;
    ipAddress: string;
    location?: {
      city: string;
      region: string;
      country: string;
    };
    authenticationMethod: Session["authenticationMethod"];
  }[];
  authorizations: {
    id: string;
    application: {
      id: string;
      name: string;
      owner: UserPrimitive;
    };
    scopes: AuthorizationScopes[];
    createdAt: string;
  }[];
  applications: {
    id: string;
    name: string;
    createdAt: string;
  }[];
  twoFactorEnabled: boolean;
} & UserPrimitive;

export type UpdateUsernameBody = {
  username?: string;
  displayName?: string;
};

export type UpdatePasswordBody = {
  existing?: string;
  new: string;
  otp?: string;
  deleteOtherSessions?: boolean;
};

export type Begin2FAResponse = {
  expires: number;
  totpUrl: string;
  secret: string;
};

export type Disable2FABody = {
  otp: string;
};

export type AdminAllUsersResponse = {
  users: {
    authorizations: number;
    sessions: number;
    id: string;
    email: string;
    username: string;
    displayName: string;
    permissions: AccountPermissions[];
    applications: {
      id: string;
      ownerId: string;
      name: string;
      authorizations: number;
      createdAt: string;
    }[];
    flags: AccountFlags[];
    createdAt: string;
    twoFactorEnabled: boolean;
  }[];
};

export type SudoRequest =
  | { otp: string }
  | { backupCode: string }
  | { password: string };

export type SudoResponse = {
  expires: number;
};

export type ExternalProvider = {
  platform: "GitHub" | "Discord";
  platformId: string;
  platformUsername: string;
  enableLogin: boolean;
};

export type PasskeyCompleteBody = {
  id: string;
  rawId: string;
  name?: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    authenticatorData?: string;
    transports?: (
      | "ble"
      | "cable"
      | "hybrid"
      | "internal"
      | "nfc"
      | "smart-card"
      | "usb"
    )[];
    publicKeyAlgorithm?: number;
    publicKey?: string;
  };
  authenticatorAttachment?: "cross-platform" | "platform";
  clientExtensionResults: {
    appId?: string;
    credProps?: {
      rk?: boolean;
    };
    hmacCreateSecret?: boolean;
  };
  type: "public-key";
};

export class Users {
  public permafrost: Permafrost;

  constructor(permafrost: Permafrost) {
    this.permafrost = permafrost;
  }

  /**
   * Checks if a username is taken. This requires a `discord-oauth` or `github-oauth` token returned from OAuth initiation.
   * @param username
   * @param param1
   * @param options
   * @returns
   */
  public checkUsername(
    username: string,
    { token }: { token: string },
    options?: RequestInit
  ) {
    return this.permafrost.makeRequest<
      CheckUsernameResponse,
      Error<"Unauthorized">
    >(
      `/checkUsername/${username}`,
      {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          authorization: `Bearer ${token}`,
        },
        ...options,
      },
      false
    );
  }

  /**
   * Gets a user's information.
   * @param id
   * @param options
   * @returns
   */
  public get<T extends undefined | string>(
    id?: T,
    options?: RequestInit
  ): ErrPromiseType<
    T extends undefined | "me" ? GetUserResponse : UserPrimitive,
    Error<"Unauthorized">
  > {
    return new Promise((res, rej) => {
      const req = this.permafrost.makeRequest<
        T extends undefined | "me" ? GetUserResponse : UserPrimitive,
        Error<"Unauthorized">
      >(`/users/${id}`, options);

      req.then((data) => {
        res(data);
        if (id === "me" || id === undefined) {
          const me = data as GetUserResponse;
          this.permafrost.auth.user = {
            id: me.id,
            username: me.username,
            displayName: me.displayName,
            createdAt: me.createdAt,
            email: me.email,
            flags: me.flags,
            permissions: me.permissions,
            twoFactorEnabled: me.twoFactorEnabled,
          };
        }
      });

      req.catch(rej);
    });
  }

  public getAsAdmin<T extends undefined | string>(
    id?: T,
    options?: RequestInit
  ) {
    return this.permafrost.makeRequest<GetUserResponse, Error<"Unauthorized">>(
      `/users/${id}`,
      options
    );
  }

  public getAll(options?: RequestInit) {
    return this.permafrost.makeRequest<
      AdminAllUsersResponse,
      Error<"Unauthorized">
    >("/users", options);
  }

  /**
   * Updates the current authorized user's information.
   * @param body
   * @param options
   * @returns
   */
  public update(
    body: UpdateUsernameBody,
    user?: string,
    options?: RequestInit
  ) {
    return this.permafrost.makeRequest<
      GenericSuccess,
      Error<"Unauthorized" | "UsernameCollision">
    >(`/users/${user || "me"}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    });
  }

  /**
   * Updates the current authorized user's password.
   * @param body
   * @param options
   * @returns
   */
  public updatePassword(body: UpdatePasswordBody, options?: RequestInit) {
    return this.permafrost.makeRequest<
      GenericSuccess,
      Error<
        | "PreconditionRequired"
        | "InvalidField"
        | "InvalidCredentials"
        | "Unauthorized"
      >
    >("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    });
  }

  /**
   * Updates the user's email address.
   * @param body
   * @param options
   * @returns
   */
  public updateEmail(body: { newEmail: string }, options?: RequestInit) {
    return this.permafrost.makeRequest<
      GenericSuccess,
      Error<
        "PreconditionRequired" | "InvalidField" | "Unauthorized" | "Conflict"
      >
    >("/users/me/email", {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    });
  }

  /**
   * Search for users by their user name.
   * @param username
   * @param options
   * @returns
   */
  public search(username: string, options?: RequestInit) {
    return this.permafrost.makeRequest<UserPrimitive[], Error<"Unauthorized">>(
      `/users/search?username=${username}`,
      options
    );
  }

  public enableSudo = (request: SudoRequest, options?: RequestInit) => {
    return this.permafrost.makeRequest<SudoResponse, Error<"Unauthorized">>(
      "/users/sudo",
      {
        method: "POST",
        body: JSON.stringify(request),
        ...options,
      }
    );
  };

  public requestEmailVerification = (options?: RequestInit) => {
    return this.permafrost.makeRequest<
      GenericSuccess,
      Error<"Unauthorized" | "RateLimited">
    >("/users/send-verification-email", {
      method: "POST",
      body: "{}",
      ...options,
    });
  };

  public create = (body: { email: string }, options?: RequestInit) => {
    return this.permafrost.makeRequest<
      GenericSuccess,
      Error<"Unauthorized" | "AlreadyExists">
    >("/users", {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  };

  public finishCreation = (
    token: string,
    body: { username: string; password: string },
    options?: RequestInit
  ) => {
    return this.permafrost.makeRequest<
      { token: string },
      Error<"Unauthorized" | "InvalidState" | "UsernameTaken">
    >(
      "/users/finish-creation",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        ...options,
      },
      false
    );
  };

  public disable = (
    user: string,
    body: { message: string },
    options?: RequestInit
  ) => {
    return this.permafrost.makeRequest<
      GenericSuccess,
      Error<"Unauthorized" | "NotFound">
    >(`/users/${user}/disable`, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  };

  public delete = (
    user: string,
    body: { message: string },
    options?: RequestInit
  ) => {
    return this.permafrost.makeRequest<
      GenericSuccess,
      Error<"Unauthorized" | "NotFound">
    >(`/users/${user}`, {
      method: "DELETE",
      body: JSON.stringify(body),
      ...options,
    });
  };

  public reactivate = (user: string, options?: RequestInit) => {
    return this.permafrost.makeRequest<
      GenericSuccess,
      Error<"Unauthorized" | "NotFound">
    >(`/users/${user}/reactivate`, {
      method: "POST",
      body: "{}",
      ...options,
    });
  };

  /**
   * Updates the permissions of a user.
   * @param application The application ID.
   * @param body
   * @param options
   * @returns
   */
  public updatePermissions = (
    user: string,
    body: { set: string[] } | { add?: string[]; remove?: string[] },
    options?: RequestInit
  ) => {
    return this.permafrost.makeRequest<
      { collaborators: UserPrimitive[] },
      Error<"Unauthorized" | "NotFound" | "InvalidRequest">
    >(`/users/${user}/permissions`, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  };

  public readonly twoFactorAuth = {
    /**
     * Begins the process to enable two-factor authentication on the current authorized user's account.
     * @param options
     * @returns
     */
    begin: (options?: RequestInit) => {
      return this.permafrost.makeRequest<
        Begin2FAResponse,
        Error<"Unauthorized" | "2FAAlreadyEnabled">
      >("/users/me/2fa/begin", {
        method: "POST",
        body: JSON.stringify({}),
        ...options,
      });
    },

    /**
     * Completes the process to enable two-factor authentication on the current authorized user's account.
     * @param body
     * @param options
     * @returns
     */
    complete: (body: { otp: string }, options?: RequestInit) => {
      return this.permafrost.makeRequest<
        GenericSuccess & { backupCodes: string[] },
        Error<"Unauthorized" | "2FAAlreadyEnabled" | "NoState" | "InvalidField">
      >("/users/me/2fa/complete", {
        method: "POST",
        body: JSON.stringify(body),
        ...options,
      });
    },

    /**
     * Disables two-factor authentication on the current authorized user's account.
     */
    disable: (body: Disable2FABody, options?: RequestInit) => {
      return this.permafrost.makeRequest<
        GenericSuccess,
        Error<
          | "Unauthorized"
          | "2FAAlreadyDisabled"
          | "InvalidField"
          | "InvalidCredentials"
        >
      >("/users/me/2fa", {
        method: "DELETE",
        body: JSON.stringify(
          body.otp.length === 6
            ? { otp: body.otp }
            : {
                backupCode: body.otp,
              }
        ),
        ...options,
      });
    },

    resetBackupCodes: (options?: RequestInit) => {
      return this.permafrost.makeRequest<
        {
          codes: string[];
        },
        Error<"Unauthorized" | "InvalidField" | "No2FA">
      >("/users/me/2fa/reset-backup-codes", {
        method: "POST",
        body: "{}",
        ...options,
      });
    },
  };

  public readonly avatar = {
    /**
     * Gets the icon for a specific user.
     * @param user The user ID.
     * @param options
     * @returns
     */
    get: (user: string, options?: RequestInit) => {
      return this.permafrost.makeRequest<
        Blob,
        Error<"Unauthorized" | "NotFound">
      >(`/users/${user}/avatar`, {
        method: "GET",
        ...options,
      });
    },

    /**
     * Updates the avatar for the authorized user.
     * @param body
     * @param options
     * @returns
     */
    update: (body: { file: Blob }, options?: RequestInit) => {
      const formData = new FormData();
      formData.append("file", body.file);
      return this.permafrost.makeRequest<
        {},
        Error<"Unauthorized" | "IncorrectBody">
      >(
        `/users/me/avatar`,
        {
          method: "POST",
          body: formData,
          ...options,
        },
        undefined,
        true
      );
    },

    /**
     * Deletes the avatar for the authorized user. If the user is an admin, they can delete the avatar of another user.
     * @param user
     * @param options
     * @returns
     */
    delete: (user?: string, options?: RequestInit) => {
      return this.permafrost.makeRequest<{}, Error<"Unauthorized">>(
        `/users/${user ? user : "me"}/avatar`,
        {
          method: "DELETE",
          ...options,
        }
      );
    },
  };

  public readonly sessions = {
    /**
     * Deletes a session.
     * @param sessionId
     * @param options
     * @returns
     */
    delete: (sessionId: string, options?: RequestInit) => {
      return this.permafrost.makeRequest<
        GenericSuccess,
        Error<"Unauthorized" | "NotFound" | "Forbidden">
      >(`/users/me/sessions/${sessionId}`, {
        method: "DELETE",
        ...options,
      });
    },

    /**
     * Deletes a session of another user. Requires admin.
     * @param userId
     * @param sessionId
     * @param options
     * @returns
     */
    deleteOther: (userId: string, sessionId: string, options?: RequestInit) => {
      return this.permafrost.makeRequest<
        GenericSuccess,
        Error<"Unauthorized" | "NotFound" | "Forbidden">
      >(`/users/${userId}/sessions/${sessionId}`, {
        method: "DELETE",
        ...options,
      });
    },
  };

  public readonly externalProviders = {
    /**
     * Gets the external providers for a user.
     * @param user
     * @param options
     * @returns
     */
    get: (user?: string, options?: RequestInit) => {
      return this.permafrost.makeRequest<
        ExternalProvider[],
        Error<"Unauthorized" | "NotFound" | "Forbidden">
      >(`/users/${user || "me"}/external-providers`, options);
    },

    /**
     * Revokes an external provider for a user.
     * @param user
     * @param provider
     * @param options
     * @returns
     */
    revoke: (
      provider: "GitHub" | "Discord",
      user?: string,
      options?: RequestInit
    ) => {
      return this.permafrost.makeRequest<
        GenericSuccess,
        Error<"Unauthorized" | "NotFound" | "Forbidden">
      >(`/users/${user || "me"}/external-providers/${provider}`, {
        method: "DELETE",
        ...options,
      });
    },

    /**
     * Sets the login permission for an external provider.
     * @param user
     * @param provider
     * @param body
     * @param options
     */
    setLoginPermission: (
      provider: "GitHub" | "Discord",
      body: { enabled: boolean },
      user?: string,
      options?: RequestInit
    ) => {
      return this.permafrost.makeRequest<
        GenericSuccess,
        Error<"Unauthorized" | "NotFound" | "Forbidden">
      >(
        `/users/${
          user || "me"
        }/external-providers/${provider}/login-permission`,
        {
          method: "PUT",
          body: JSON.stringify(body),
          ...options,
        }
      );
    },

    /**
     * Creates a connection state for a user.
     * @param user
     * @param body
     * @param options
     * @returns
     */
    createConnectionState: (options?: RequestInit) => {
      return this.permafrost.makeRequest<
        { state: string },
        Error<"Unauthorized" | "NotFound" | "Forbidden">
      >(`/users/me/connection-state`, {
        method: "GET",
        ...options,
      });
    },
  };

  public readonly passkeys = {
    get: (options?: RequestInit) => {
      return this.permafrost.makeRequest<Passkey[], Error<"Unauthorized">>(
        `/users/me/passkeys`,
        {
          method: "GET",
          ...options,
        },
        true
      );
    },
    update: (id: string, body: { name: string }, options?: RequestInit) => {
      return this.permafrost.makeRequest<
        Passkey,
        Error<"Unauthorized" | "NotFound">
      >(
        `/users/me/passkeys/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
          ...options,
        },
        true
      );
    },
    delete: (id: string, options?: RequestInit) => {
      return this.permafrost.makeRequest<
        {},
        Error<"Unauthorized" | "NotFound">
      >(
        `/users/me/passkeys/${id}`,
        {
          method: "DELETE",
          ...options,
        },
        true
      );
    },
    getSetupInformation: (options?: RequestInit) => {
      return this.permafrost.makeRequest(
        `/users/me/passkey/registration/start`,
        {
          method: "GET",
          ...options,
        },
        true
      );
    },
    setup: (body: PasskeyCompleteBody, options?: RequestInit) => {
      return this.permafrost.makeRequest<
        {
          verified: boolean;
        },
        Error<"BadRequest">
      >(
        `/users/me/passkey/registration/complete`,
        {
          method: "POST",
          body: JSON.stringify(body),
          ...options,
        },
        true
      );
    },
  };
}
