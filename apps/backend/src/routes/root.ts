import { join } from "path";
import meta from "../meta";
import { route } from "../utils/routeBuilder";

export default route({
  path: "/",
  method: "GET",
  async exec(inputs, req, res, fastify) {
    res.header("Content-Type", "text/html");

    const pageFile = Bun.file(join(__dirname, "../templates/root.html"));
    const pageData = await pageFile.text();

    res.send(
      pageData
        .replace("{version}", `v${meta.version}`)
        .replace("{frontendURL}", fastify.config().frontendUrl)
    );
  },
});
