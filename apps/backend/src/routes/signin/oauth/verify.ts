import { DateTime } from "luxon";
import * as z from "zod/v4";
import type { schemas } from "../../../plugins/state";
import { error } from "../../../utils/logger";
import { randomAlphanumeric } from "../../../utils/random";
import { route } from "../../../utils/routeBuilder";
import * as discord from "./providers/discord";
import * as github from "./providers/github";

export const providers = {
  discord,
  github,
};
export const providerEnum = z.enum(["discord", "github"]);
export const providerNames: {
  [key: string]: z.output<
    (typeof schemas)["user-login-token"]["zod"]
  >["createdVia"];
} = {
  discord: "Discord",
  github: "GitHub",
};

export default route({
  path: "/oauth/verify/:provider",
  method: "GET",
  schema: {
    query: z.object({
      state: z.string(),
      code: z.string().optional(),
    }),
    path: z.object({
      provider: z.enum(["discord" as const, "github" as const]),
    }),
  },
  rateLimit: 3,
  async exec({ query, path }, req, res, fastify) {
    const { prisma, state } = fastify;
    const config = fastify.config();

    const uriUsed = `${
      config.backendUrl
    }${req.routeOptions.config.url.replaceAll(":provider", path.provider)}`;

    // Check OAuth states
    const oAuthState = {
      ...(await state.model("oauth-states").get(query.state)),
    };
    state.model("oauth-states").delete(query.state);

    if (!query.code) {
      return res.redirect(`${config.frontendUrl}/auth?message=loginCancelled`);
    } else if (oAuthState === undefined || oAuthState.ip !== req.ip) {
      return res.redirect(`${config.frontendUrl}/auth?message=stateMismatch`);
    } else if (oAuthState.expires && oAuthState.expires < new Date()) {
      return res.redirect(`${config.frontendUrl}/auth?message=stateExpired`);
    }

    let data, token;
    const provider = providers[path.provider];

    try {
      // Check the token received.
      token = await provider.getTokenFromCode(query.code, uriUsed, fastify);

      if (typeof token !== "string")
        return res.redirect((token as any).redirectTo);

      // Get user information.
      data = await provider.getMetadata(token, fastify);

      if (data.success === false) {
        return res.redirect((data.error as any).redirectTo);
      }
    } catch (e) {
      error("Error while verifying OAuth token", e);
      error("Check your OAuth client ID & secret.");
      return res.redirect(`${config.frontendUrl}/auth?message=internalError`);
    }

    // Link the account if the user is logged in.
    if (oAuthState.link) {
      const existingIdConnection = await prisma.oAuthSignInData.findFirst({
        where: {
          platform: providerNames[path.provider]!,
          platformId: data.id,
        },
      });

      if (existingIdConnection) {
        return res.redirect(
          `${config.frontendUrl}/auth?message=oauthAlreadyLinked`
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: oAuthState.link },
      });

      if (!user) {
        return res.redirect(`${config.frontendUrl}/auth?message=userNotFound`);
      }

      const loginMethod = await prisma.oAuthSignInData.findFirst({
        where: { userId: user.id, platform: providerNames[path.provider]! },
      });

      if (loginMethod) {
        return res.redirect(
          `${config.frontendUrl}/auth?message=oauthAlreadyLinked`
        );
      }

      await prisma.oAuthSignInData.create({
        data: {
          platform: providerNames[path.provider]! as "GitHub" | "Discord",
          userId: user.id,
          platformId: data.id,
          platformUsername: data.username,
          enableLogin: true,
        },
      });

      return res.redirect(
        `${config.frontendUrl}/dashboard/connections?message=connectedSuccessfully`
      );
    }

    // Check if a user already exists under these OAuth credentials.
    const user = await provider.getExistingUser(data.id, fastify);

    if (user) {
      const loginMethod = await prisma.oAuthSignInData.findFirst({
        where: { userId: user.id, platform: providerNames[path.provider]! },
      })!;

      if (!loginMethod!.enableLogin) {
        return res.redirect(
          `${config.frontendUrl}/auth?message=oauthLoginDisabled`
        );
      }

      const loginToken = randomAlphanumeric(64);
      state.model("user-login-token").set(loginToken, {
        userId: user.id,
        expires: DateTime.now().plus({ minutes: 5 }).toJSDate(),
        token,
        createdVia: providerNames[path.provider],
        notifyEmail: false,
      });

      return res.redirect(
        `${config.frontendUrl}/auth/token?token=${loginToken}`
      );
    }

    // If the user does not have an account yet, we'll ask them to make one.
    if (provider.checkMembership(token, fastify) === false) {
      return res.redirect(`${config.frontendUrl}/auth?message=oauthNotMember`);
    }

    if (!fastify.config().oauthSignups) {
      return res.redirect(
        `${config.frontendUrl}/auth?message=registrationDisabled`
      );
    }

    // Check if the email is already taken.
    const usersWithSameEmail = await prisma.user.count({
      where: { email: data.email },
    });

    if (usersWithSameEmail) {
      return res.redirect(`${config.frontendUrl}/auth?message=oauthEmailTaken`);
    }

    // Check if the username is already taken.
    const userWithSameName = await prisma.user.count({
      where: { username: data.username },
    });

    const loginToken = randomAlphanumeric("passwordReset");
    state.model("oauth-registration").set(loginToken, {
      expires: DateTime.now().plus({ minutes: 5 }).toJSDate(),
      provider: path.provider,
      token,
    });

    return res.redirect(
      `${config.frontendUrl}/auth/create?type=${
        path.provider
      }&token=${loginToken}&username=${data.username}&nameTaken=${
        userWithSameName > 0
      }`
    );
  },
});
