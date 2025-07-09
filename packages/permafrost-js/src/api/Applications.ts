import { Permafrost } from "./Permafrost";
import type {
  ApplicationPrimitive,
  Error,
  GenericSuccess,
  UserPrimitive,
} from "./Types";

/* Types */

export type GetApplicationResponseBase = ApplicationPrimitive & {
  homepageURL?: string;
  termsOfServiceURL?: string;
  privacyPolicyURL?: string;
  owner: UserPrimitive;
  redirectURIs: string[];
  isAuthorized: boolean;
};

export type GetApplicationResponseUser = GetApplicationResponseBase;
export type GetApplicationResponseCollaborator = GetApplicationResponseBase & {
  collaborators: UserPrimitive[];
  role: "owner" | "collaborator";
};

export type GetApplicationResponse =
  | GetApplicationResponseUser
  | GetApplicationResponseCollaborator;

export type ApplicationsUpdateBody = {
  name?: string;
  homepageURL?: string;
  termsOfServiceURL?: string;
  privacyPolicyURL?: string;
};

export type ApplicationsCreateBody = ApplicationsUpdateBody & {
  name: string;
  redirectURIs?: string[];
  collaborators?: string[];
};

export type ListApplicationsResponse = {
  applications: (ApplicationPrimitive & {
    redirectURIs: string[];
    role: "owner" | "collaborator";
    owner: UserPrimitive;
  })[];
};

export class Applications {
  public permafrost: Permafrost;

  constructor(permafrost: Permafrost) {
    this.permafrost = permafrost;
  }

  /**
   * Gets the authorized user's applications.
   * @param options
   * @returns
   */
  public list(user?: string, options?: RequestInit) {
    return this.permafrost.makeRequest<
      ListApplicationsResponse,
      Error<"NotFound">
    >(`/${user ? `users/${user}/` : ""}applications`, {
      method: "GET",
      ...options,
    });
  }

  public listAll(options?: RequestInit) {
    return this.permafrost.makeRequest<
      ListApplicationsResponse,
      Error<"NotFound">
    >(`/all-applications`, {
      method: "GET",
      ...options,
    });
  }

  /**
   * Gets a specific application.
   * @param application The application ID.
   * @param options
   * @returns
   */
  public get(application: string, options?: RequestInit) {
    return this.permafrost.makeRequest<
      GetApplicationResponse,
      Error<"NotFound">
    >(`/applications/${application}`, {
      method: "GET",
      ...options,
    });
  }

  /**
   * Creates a new application.
   * @param body
   * @param options
   * @returns
   */
  public create(body: ApplicationsCreateBody, options?: RequestInit) {
    return this.permafrost.makeRequest<
      GetApplicationResponseCollaborator & { clientSecret: string },
      Error<"Unauthorized" | "NotFound" | "IncorrectBody">
    >(`/applications`, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  }

  /**
   * Updates a specific application.
   * @param application The application ID.
   * @param body
   * @param options
   * @returns
   */
  public update(
    application: string,
    body: ApplicationsUpdateBody,
    options?: RequestInit
  ) {
    return this.permafrost.makeRequest<
      GetApplicationResponseCollaborator,
      Error<"Unauthorized" | "NotFound" | "IncorrectBody">
    >(`/applications/${application}`, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  }

  /**
   * Deletes a specific application.
   * @param application The application ID.
   * @param options
   * @returns
   */
  public delete(application: string, options?: RequestInit) {
    return this.permafrost.makeRequest<{}, Error<"Unauthorized" | "NotFound">>(
      `/applications/${application}`,
      {
        method: "DELETE",
        ...options,
      }
    );
  }

  /**
   * Resets the secret for a specific application.
   * @param application The application ID.
   * @param body
   * @param options
   * @returns
   */
  public resetSecret(application: string, options?: RequestInit) {
    return this.permafrost.makeRequest<
      { clientSecret: string },
      Error<"Unauthorized" | "NotFound">
    >(`/applications/${application}/secret`, {
      method: "POST",
      body: "{}",
      ...options,
    });
  }

  public transfer(
    application: string,
    body: { to: string },
    options?: RequestInit
  ) {
    return this.permafrost.makeRequest<
      GenericSuccess,
      Error<"Unauthorized" | "NotFound" | "IncorrectBody">
    >(`/applications/${application}/transfer`, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  }

  public getUsers(application: string, options?: RequestInit) {
    return this.permafrost.makeRequest<
      { users: (UserPrimitive & { authorizedAt: string })[] },
      Error<"Unauthorized" | "NotFound">
    >(`/applications/${application}/users`, {
      method: "GET",
      ...options,
    });
  }

  public readonly redirectURIs = {
    /**
     * Sets an app's redirect URIs.
     * @param application The application ID.
     * @param body
     * @param options
     * @returns
     */
    update: (
      application: string,
      body: { set: string[] } | { add?: string[]; remove?: string[] },
      options?: RequestInit
    ) => {
      return this.permafrost.makeRequest<
        { collaborators: UserPrimitive[] },
        Error<"Unauthorized" | "NotFound" | "InvalidRequest">
      >(`/applications/${application}/redirect-uris`, {
        method: "POST",
        body: JSON.stringify(body),
        ...options,
      });
    },
  };

  public readonly collaborators = {
    /**
     * Sets an app's collaborators.
     * @param application The application ID.
     * @param body
     * @param options
     * @returns
     */
    update: (
      application: string,
      body: { set: string[] } | { add?: string[]; remove?: string[] },
      options?: RequestInit
    ) => {
      return this.permafrost.makeRequest<
        { collaborators: UserPrimitive[] },
        Error<"Unauthorized" | "NotFound" | "InvalidRequest">
      >(`/applications/${application}/collaborators`, {
        method: "POST",
        body: JSON.stringify(body),
        ...options,
      });
    },
  };

  public readonly icon = {
    /**
     * Gets the icon for a specific application.
     * @param application The application ID.
     * @param options
     * @returns
     */
    get: (application: string, options?: RequestInit) => {
      return this.permafrost.makeRequest<
        Blob,
        Error<"Unauthorized" | "NotFound">
      >(`/applications/${application}/icon`, {
        method: "GET",
        ...options,
      });
    },

    /**
     * Updates the icon for a specific application.
     * @param application The application ID.
     * @param body
     * @param options
     * @returns
     */
    update: (
      application: string,
      body: { file: Blob },
      options?: RequestInit
    ) => {
      const formData = new FormData();
      formData.append("file", body.file);
      return this.permafrost.makeRequest<
        {},
        Error<"Unauthorized" | "NotFound" | "IncorrectBody">
      >(
        `/applications/${application}/icon`,
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
     * Deletes the icon for a specific application.
     * @param application The application ID.
     * @param options
     * @returns
     */
    delete: (application: string, options?: RequestInit) => {
      return this.permafrost.makeRequest<
        {},
        Error<"Unauthorized" | "NotFound">
      >(`/applications/${application}/icon`, {
        method: "DELETE",
        ...options,
      });
    },
  };
}
