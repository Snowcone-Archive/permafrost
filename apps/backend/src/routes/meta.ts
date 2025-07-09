import meta from "../meta";
import { newAuthHandler } from "../utils/auth";
import { route } from "../utils/routeBuilder";

export const getMeta = route({
  path: "/meta",
  method: "GET",
  async exec(inputs, req, res, fastify) {
    const token = String(req.headers.authorization).replace("Bearer ", "");

    let isLoggedIn = false;
    if (token) {
      const authHandler = await newAuthHandler(req.server);
      const tokenResult = await authHandler.checkToken(token);
      isLoggedIn = tokenResult.success;
    }

    const loginOptions = [];

    if (fastify.config().discordClientId) {
      loginOptions.push({
        type: "discord",
        clientID: fastify.config().discordClientId,
        color: "#5662f6",
        redirectURL: `https://discord.com/oauth2/authorize?response_type=code&client_id=${
          fastify.config().discordClientId
        }&redirect_uri=${
          fastify.config().backendUrl
        }/oauth/verify/discord&scope=${encodeURIComponent(
          "identify guilds email guilds.members.read"
        )}&state={{state}}&prompt=none`,
      });
    }

    if (fastify.config().githubClientId) {
      loginOptions.push({
        type: "github",
        clientID: fastify.config().githubClientId,
        color: "#333",
        redirectURL: `https://github.com/login/oauth/authorize?client_id=${
          fastify.config().githubClientId
        }&&redirect_uri=${
          fastify.config().backendUrl
        }/oauth/verify/github&scope=${encodeURIComponent(
          "read:user user:email read:org"
        )}&state={{state}}`,
      });
    }

    res.send({
      message: "Permafrost: Authentication gateway for Snowflake",
      version: meta.version,
      authenticated: isLoggedIn,
      loginOptions,
      outOfBox: fastify.config().outOfBoxExperience,
    });
  },
});
