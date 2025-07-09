import { Permafrost } from "./Permafrost";
import type {
  AccountPermissions,
  AuthorizationScopes,
  Error,
  GenericSuccess,
  UserPrimitive,
} from "./Types";

export type AuthorizationsListResponse = {
  authorizations: {
    id: string;
    application: {
      authorizations: number;
      id: string;
      name: string;
      owner: UserPrimitive;
    };
    scopes: AuthorizationScopes[];
    createdAt: string;
  }[];
};

export type AuthorizationCreateRequest = {
  application: string;
  scopes: AuthorizationScopes[];
};

export type AuthorizationCreateResponse = {
  id: string;
  application: {
    id: string;
    name: string;
  };
  permissions: AccountPermissions[];
  requestCode: string;
};

export class Authorizations {
  public permafrost: Permafrost;

  constructor(permafrost: Permafrost) {
    this.permafrost = permafrost;
  }

  /**
   * List all authorizations for the current user.
   * @param options
   * @returns
   */
  public list(user?: string, options?: RequestInit) {
    return this.permafrost.makeRequest<AuthorizationsListResponse>(
      `/${user ? `users/${user}/` : ""}authorizations`,
      options
    );
  }

  /**
   * List all authorizations for the current user.
   * @param options
   * @returns
   */
  public authorize(body: AuthorizationCreateRequest, options?: RequestInit) {
    return this.permafrost.makeRequest<
      AuthorizationCreateResponse,
      Error<"InvalidPayload" | "NotFound">
    >(`/authorizations`, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  }

  /**
   * Revoke an authorization.
   * @param id
   * @param options
   * @returns
   */
  public revoke(id: string, options?: RequestInit) {
    return this.permafrost.makeRequest<GenericSuccess, Error<"NotFound">>(
      `/authorizations/${id}`,
      {
        method: "DELETE",
        ...options,
      }
    );
  }
}
