import { ErrPromise } from "../ErrPromise";
import { Permafrost } from "./Permafrost";
import type {
  AccountFlags,
  AccountPermissions,
  Error,
  GenericSuccess,
  Session,
  UserPrimitive,
} from "./Types";

/* Types */

export type AuthenticationResponse = {
  user: UserPrimitive & {
    email: string;
    flags: AccountFlags[];
    permissions: AccountPermissions[];
    twoFactorEnabled: boolean;
  };
  session: Session;
};

export type Passkey = {
  id: string;
  name: string;
  transports: (
    | "ble"
    | "cable"
    | "hybrid"
    | "internal"
    | "nfc"
    | "smart-card"
    | "usb"
  )[];
  lastUsed: string;
  createdAt: string;
};

export type PasskeyLoginBody = {
  id: string;
  sessionID: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
  authenticatorAttachment?: "cross-platform" | "platform";
  clientExtensionResults: {
    appid?: boolean;
    credProps?: {
      rk?: boolean;
    };
    hmacCreateSecret?: boolean;
  };
  type: "public-key";
};

export class Authentication {
  public permafrost: Permafrost;
  public session?: Session;
  public user?: AuthenticationResponse["user"];

  constructor(permafrost: Permafrost) {
    this.permafrost = permafrost;
  }

  private handleAuthenticationResponse(response: AuthenticationResponse) {
    this.session = response.session;
    this.user = response.user;
  }

  /**
   * Logs out the current user.
   */
  public logout() {
    this.session = undefined;
    this.user = undefined;
  }

  /**
   * Authenticates a user using their email, password, and OTP code if required.
   * @param body
   * @param options
   * @returns
   */
  public password(
    body: { email: string; password: string; otp?: string },
    options?: RequestInit
  ) {
    return new ErrPromise<
      AuthenticationResponse,
      Error<"PreconditionRequired" | "InvalidField">
    >((res, rej) => {
      const promise = this.permafrost.makeRequest<
        AuthenticationResponse,
        Error<"PreconditionRequired" | "InvalidField">
      >(
        "/users/auth",
        {
          method: "POST",
          body: JSON.stringify({
            otp: body.otp?.length === 6 ? body.otp : undefined,
            backupCode: body.otp?.length !== 6 ? body.otp : undefined,
            password: body.password,
            email: body.email,
          }),
          ...options,
        },
        false
      );

      promise
        .then((result) => {
          this.handleAuthenticationResponse(result);
          res(result);
        })
        .catch(rej);
    });
  }

  /**
   * Authenticates a user using an authentication token. These are returned from OAuth sign-ins.
   * @param body
   * @param options
   * @returns
   */
  public token(body: { token: string; otp?: string }, options?: RequestInit) {
    return new ErrPromise<
      AuthenticationResponse,
      Error<"PreconditionRequired" | "InvalidField">
    >((res, rej) => {
      const promise = this.permafrost.makeRequest<
        AuthenticationResponse,
        Error<"PreconditionRequired" | "InvalidField">
      >(
        "/users/auth/token",
        {
          method: "POST",
          body: JSON.stringify(body),
          ...options,
        },
        false
      );

      promise
        .then((result) => {
          this.handleAuthenticationResponse(result);
          res(result);
        })
        .catch(rej);
    });
  }

  /**
   * Authorization endpoints related to completing OAuth flows.
   */
  public oauth = {
    /**
     * Creates a state parameter for OAuth flows.
     * @param options
     * @returns
     */
    createOAuthState: (options?: RequestInit) => {
      return this.permafrost.makeRequest<
        { state: string },
        Error<"RateLimitError">
      >(
        "/oauth/create-state",
        {
          method: "GET",
          ...options,
        },
        false
      );
    },

    /**
     * Completes the OAuth flow for a GitHub account.
     * @param param0
     * @param options
     * @returns
     */
    createFromGithub: (
      code: string,
      { username }: { username: string },
      options?: RequestInit
    ) => {
      return this.permafrost.makeRequest<{ token: string }>(
        `/oauth/create/github`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${code}`,
          },
          body: JSON.stringify({
            username,
          }),
          ...options,
        },
        false
      );
    },

    /**
     * Completes the OAuth flow for a Discord account.
     * @param param0
     * @param options
     * @returns
     */
    createFromDiscord: (
      code: string,
      { username }: { username: string },
      options?: RequestInit
    ) => {
      return this.permafrost.makeRequest<{ token: string }>(
        `/oauth/create/discord`,
        {
          method: "POST",
          body: JSON.stringify({
            username,
          }),
          headers: {
            authorization: `Bearer ${code}`,
          },
          ...options,
        },
        false
      );
    },
  };

  /**
   * Authorization endpoints related to password resets.
   */
  public passwordReset = {
    /**
     * Sends an E-Mail to the user with a reset token.
     * @param param0
     * @param options
     * @returns
     */
    request: ({ email }: { email: string }, options?: RequestInit) => {
      return this.permafrost.makeRequest<GenericSuccess>(
        `/users/me/reset`,
        {
          method: "POST",
          body: JSON.stringify({ email }),
          ...options,
        },
        false
      );
    },

    /**
     * Completes the password reset flow.
     * @param param0
     * @param options
     * @returns
     */
    submit: (
      {
        userId,
        password,
        token,
      }: { userId: string; password: string; token: string },
      options?: RequestInit
    ) => {
      return this.permafrost.makeRequest<
        GenericSuccess,
        Error<"Unauthorized" | "NotAllowed">
      >(
        `/users/${userId}/reset`,
        {
          method: "PUT",
          body: JSON.stringify({ password }),
          headers: {
            authorization: `Bearer ${token}`,
          },
          ...options,
        },
        false
      );
    },
  };

  public passkeys = {
    startLogin: (options?: RequestInit) => {
      return this.permafrost.makeRequest<{
        options: {
          rpId: string;
          challenge: string;
          allowCredentials: [];
          timeout: number;
          userVerification: "required" | "preferred" | "discouraged";
        };
        sessionID: string;
      }>(
        `/passkey/login/start`,
        {
          method: "GET",
          ...options,
        },
        false
      );
    },
    completeLogin: (
      body: PasskeyLoginBody & {
        sessionID: string;
      },
      options?: RequestInit
    ) => {
      return new ErrPromise<AuthenticationResponse, Error<"BadRequest">>(
        (res, rej) => {
          const promise = this.permafrost.makeRequest<AuthenticationResponse>(
            `/passkey/login/complete`,
            {
              method: "POST",
              body: JSON.stringify(body),
              ...options,
            },
            false
          );

          promise
            .then((result) => {
              this.handleAuthenticationResponse(result);
              res(result);
            })
            .catch(rej);
        }
      );
    },
  };
}
