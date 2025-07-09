import * as z from "zod/v4";
import { warn } from "../../../../utils/logger";
import { emailSchema } from "../../../../utils/validation";
import type {
  GetExistingUserFunction,
  GetMetadataFunction,
  GetTokenFunction,
  MembershipValidityCheckFunction,
} from "./providers";

// Schema definitions
const UserDataSchema = z.object({
  id: z.number(),
  login: z.string(),
  organizations_url: z.url(),
  avatar_url: z.url(),
  email: emailSchema.optional().nullable(),
});

const EmailsSchema = z.array(
  z.object({
    email: emailSchema,
    primary: z.boolean(),
    verified: z.boolean(),
  })
);

const getUserdata = async (token: string) => {
  // Get the userdata
  const userData = await UserDataSchema.safeParseAsync(
    await (
      await fetch("https://api.github.com/user", {
        headers: {
          Authorization: token,
        },
      })
    ).json()
  );

  if (userData.success === false) {
    warn("Invalid user data!", z.prettifyError(userData.error), userData);
    return undefined;
  }

  return userData.data;
};

export const getTokenFromCode: GetTokenFunction = async (
  code,
  _redirect,
  fastify
) => {
  const config = fastify.config();

  // Get access token
  const data = (await (
    await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
      }),
    })
  ).json()) as {
    access_token: string;
    token_type: string;
    scope: string;
  };

  // Cancelled
  if (!data.scope) {
    return {
      status: 400,
      redirectTo: `${config.frontendUrl}/auth?message=loginCancelled`,
      error: {
        code: "LoginCancelled",
        message: "The login was cancelled by the user.",
      },
    };
  }

  // Verify scopes
  if (
    !data.scope.includes("read:org") ||
    !data.scope.includes("user:email") ||
    !data.scope.includes("read:user")
  ) {
    return {
      status: 400,
      redirectTo: `${config.frontendUrl}/auth?message=invalidScopes`,
      error: {
        code: "MissingScopes",
        message: "The required scopes are missing.",
      },
    };
  }

  const token = `${data.token_type} ${data.access_token}`;
  return token;
};

export const getMetadata: GetMetadataFunction = async (token, fastify) => {
  const userData = await getUserdata(token);
  if (userData === undefined) {
    return {
      success: false,
      code: 500,
      error: {
        code: "InvalidUserData",
        message: "The user data provided is invalid.",
      },
    };
  }

  // If the user has a public email, we'll use that.
  if (userData.email != null) {
    return {
      success: true,
      email: userData.email,
      username: userData.login,
      id: String(userData.id),
      avatarUrl: userData.avatar_url,
    };
  }

  // If the user doesn't have a public email, we'll fetch their private emails, and use the primary email..
  const emailsData = await EmailsSchema.safeParseAsync(
    await (
      await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: token,
        },
      })
    ).json()
  );

  if (emailsData.success === false) {
    warn("Invalid email data!", z.prettifyError(emailsData.error), emailsData);
    return {
      success: false,
      code: 500,
      error: {
        code: "InvalidEmailData",
        message: "The user email data provided is invalid.",
      },
    };
  }

  // Find their primary email.
  const primaryEmail = emailsData.data.find(
    (email) => email.primary && email.verified
  );

  if (primaryEmail) {
    return {
      success: true,
      email: primaryEmail.email!,
      username: userData.login,
      id: String(userData.id),
      avatarUrl: userData.avatar_url,
    };
  }

  // User has no primary email, somehow.
  return {
    success: false,
    code: 400,
    error: {
      code: "NoPrimaryEmail",
      message: "The user has no verified primary email address.",
    },
  };
};

export const getExistingUser: GetExistingUserFunction = async (
  id,
  { prisma }
) => {
  // Get if the user has an account on Permafrost already.
  return await prisma.user.findFirst({
    where: {
      oauthSignInData: {
        some: {
          AND: {
            platform: "GitHub",
            platformId: id,
          },
        },
      },
    },
  });
};

export const checkMembership: MembershipValidityCheckFunction = async (
  token,
  { config }
) => {
  const userData = await getUserdata(token);
  if (userData === undefined) {
    return false;
  }

  // Fetch the user's organizations, and check if they are in the allowed organization.
  const organizations = (await (
    await fetch(userData.organizations_url, {
      headers: {
        Authorization: token,
      },
    })
  ).json()) as { id: number }[];

  if (!organizations.some((org) => org.id == Number(config.githubOrgId))) {
    return false;
  }

  return true;
};
