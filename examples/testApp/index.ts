import fastify from "fastify";
import path from "path";

const app = fastify();

const format = (str: string, values: { [key: string]: string }) => {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] || match;
  });
};

app.get("/", async (req, res) => {
  res.header("Content-Type", "text/html");
  return format(await Bun.file(path.join(__dirname, "index.html")).text(), {
    TEST_APP_FRONTEND_URL: process.env.TEST_APP_FRONTEND_URL!,
    TEST_APP_CLIENT_ID: process.env.TEST_APP_CLIENT_ID!,
    TEST_APP_SCOPES: process.env.TEST_APP_SCOPES!,
    TEST_APP_REDIRECT_URI: process.env.TEST_APP_REDIRECT_URI!,
  });
});

app.get("/auth", async (req, res) => {
  console.log("Has been returned from permafrost");
  const { code } = req.query as { code: string };

  // Get access token
  console.log("Getting access token from code:", code);

  try {
    const request = await fetch("http://127.0.0.1:1234/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: process.env.TEST_APP_CLIENT_ID,
        client_secret: process.env.TEST_APP_CLIENT_SECRET,
      }),
    });

    console.log(request);
    const accessToken = (await request.json()) as {
      token_type: string;
      access_token: string;
      scope: string;
    };

    console.log("Got access token:", accessToken);

    console.log(
      `Access token: ${accessToken.token_type} ${accessToken.access_token}, scope: ${accessToken.scope}`
    );

    // Get user
    const user = (await (
      await fetch("http://127.0.0.1:1234/users/me", {
        headers: {
          Authorization: `${accessToken.token_type} ${accessToken.access_token}`,
        },
      })
    ).json()) as {
      id: string;
      username: string;
      displayName: string;
      email: string;
      createdAt: string;
    };

    console.log(user);

    res.header("Content-Type", "text/html");
    return format(
      await Bun.file(path.join(__dirname, "code.html")).text(),
      user
    );
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

app
  .listen({
    port: 5050,
  })
  .then(() => {
    console.log("Server is running at http://localhost:5050");
  });
