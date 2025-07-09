import * as z from "zod/v4";
import { emailSchema } from "../../../../utils/validation";
import type {
  GetExistingUserFunction,
  GetMetadataFunction,
  GetTokenFunction,
  MembershipValidityCheckFunction,
} from "./providers";

// Schema definitions
const guildsResponseSchema = z.array(
  z.object({
    id: z.string(),
  })
);

const guildMemberSchema = z.object({
  roles: z.array(z.coerce.string()),
});

const tokenExchangeSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.int(),
  refresh_token: z.string(),
  scope: z.string(),
});

const discordUserData = z.object({
  id: z.string(),
  username: z.string(),
  avatar: z.string().optional(), // Avatar hash
  verified: z.boolean().default(false), // If their email is verified
  email: emailSchema.optional(),
  global_name: z.string().optional(),
});

export const getTokenFromCode: GetTokenFunction = async (
  code,
  redirect,
  fastify
) => {
  const config = fastify.config();

  const tokenExchangeResponse = await (
    await fetch(`https://discord.com/api/v10/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(
          `${config.discordClientId}:${config.discordClientSecret}`
        )}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect,
      }),
    })
  ).json();

  const exchangeData = await tokenExchangeSchema.parseAsync(
    tokenExchangeResponse
  );

  if (
    !exchangeData.scope.includes("identify") ||
    !exchangeData.scope.includes("guilds") ||
    !exchangeData.scope.includes("email") ||
    !exchangeData.scope.includes("guilds.members.read")
  ) {
    return {
      status: 400,
      redirectTo: `${config.frontendUrl}/auth?message=missingScopes`,
      error: {
        code: "MissingScopes",
        message: "The required scopes are missing.",
      },
    };
  }

  const token = `${exchangeData.token_type} ${exchangeData.access_token}`;
  return token;
};

// for later
//

export const getMetadata: GetMetadataFunction = async (token, fastify) => {
  const { config, prisma } = fastify;

  const userDataResponse = await fetch(
    `https://discord.com/api/v10/users/@me`,
    {
      headers: {
        Authorization: token,
      },
    }
  );

  const userData = await discordUserData.parseAsync(
    await userDataResponse.json()
  );

  if (!userData.email || !userData.verified) {
    return {
      success: false,
      code: 403,
      redirectTo: `${config.frontendUrl}/auth?message=emailNotVerified`,
      error: {
        code: "EmailNotVerified",
        message: "Your email is not verified.",
      },
    };
  }

  return {
    success: true,
    email: userData.email || "",
    username: userData.username,
    id: userData.id,
    avatarUrl: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`,
  };
};

export const getExistingUser: GetExistingUserFunction = async (
  id,
  { prisma }
) => {
  return await prisma.user.findFirst({
    where: {
      oauthSignInData: {
        some: {
          AND: {
            platform: "Discord",
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
  // Check that they are in the Snowflake guild
  const guildsResponse = await fetch(
    `https://discord.com/api/v10/users/@me/guilds`,
    {
      headers: {
        Authorization: token,
      },
    }
  );

  const guildsData = await guildsResponseSchema.parseAsync(
    await guildsResponse.json()
  );

  if (!guildsData.some((guild) => guild.id === config.discordGuildId)) {
    return false;
  }

  // If a role is specified, check that they have it
  if (config.discordRole) {
    const rolesResponse = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${config.discordGuildId}/member`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const rolesData = await guildMemberSchema.parseAsync(
      await rolesResponse.json()
    );

    if (!rolesData.roles.includes(config.discordRole)) {
      return false;
    }
  }

  return true;
};
