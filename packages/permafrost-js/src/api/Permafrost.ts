import { ErrPromise } from "../ErrPromise";
import { Administration } from "./Administration";
import { Applications } from "./Applications";
import { Authentication } from "./Authentication";
import { Authorizations } from "./Authorizations";
import type { DefaultError, Metadata } from "./Types";
import { Users } from "./Users";

/**
 * Permafrost API
 * Notice: this class is not intended to be used by end users. Users
 * should create applications and get user information from there,
 * as authenticating directly is insecure.
 */
export class Permafrost {
  public endpoint: string;
  public readonly auth: Authentication;
  public readonly applications: Applications;
  public readonly users: Users;
  public readonly authorizations: Authorizations;
  public readonly admin: Administration;

  public static USER_AGENT = "Permafrost/1.0.0";

  constructor(endpoint?: string) {
    this.auth = new Authentication(this);
    this.applications = new Applications(this);
    this.users = new Users(this);
    this.authorizations = new Authorizations(this);
    this.admin = new Administration(this);

    this.endpoint = endpoint || "https://pfapi.snowflake.blue";
  }

  public getMetadata() {
    return this.makeRequest<Metadata, DefaultError>(
      `/meta?t=${Date.now()}`,
      {},
      false
    );
  }

  /**
   * Utility function to make requests to the Permafrost API.
   * @param url
   * @param init
   * @param requireAuth
   * @returns
   */
  public makeRequest<S, E extends DefaultError = DefaultError>(
    url: string,
    init: RequestInit = {},
    requireAuth = true,
    emptyContentTypes = false
  ): ErrPromise<S, E> {
    if (requireAuth && this.auth.session === undefined) {
      return new ErrPromise<S, E>((_, rej) => {
        rej({
          error: {
            code: "Unauthorized",
            message: "Authorization is needed to request this information.",
          },
        } as E);
      });
    }

    const anyHeaders = init.headers as any;

    const contentType =
      emptyContentTypes === true
        ? undefined
        : anyHeaders !== undefined && anyHeaders["content-type"]
        ? anyHeaders["content-type"]
        : "application/json";

    return new ErrPromise<S, E>((res, rej) => {
      fetch(url.startsWith("http") ? this.endpoint : `${this.endpoint}${url}`, {
        ...init,
        headers: {
          ...(emptyContentTypes ? {} : { "content-type": contentType }),
          "user-agent": navigator?.userAgent
            ? `${navigator.userAgent} (${Permafrost.USER_AGENT})`
            : Permafrost.USER_AGENT,
          ...(anyHeaders?.authorization !== undefined
            ? {
                authorization: anyHeaders?.authorization,
              }
            : this.auth.session !== undefined
            ? {
                authorization: `Bearer ${this.auth.session.token}`,
              }
            : {}),
        },
        mode: "cors",
        signal: AbortSignal.timeout(30000),
      })
        .then(async (r) => {
          const resp = await r.json();

          r.ok ? res(resp as S) : rej(resp as E);
        })
        .catch((e) => {
          console.error(e);
          rej({
            error: {
              code: "CouldNotConnect",
              message: `Could not connect to the authentication API: ${this.endpoint}.`,
            },
          } as E);
        });
    });
  }
}
