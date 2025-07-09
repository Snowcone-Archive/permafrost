import { route } from "../../../utils/routeBuilder";
import { Guards } from "../../..";
export default route({
  path: "/users/me/passkeys",
  method: "GET",
  guards: [Guards.authenticated],
  async exec(inputs, req, res, { prisma }) {
    return prisma.passkey.findMany({
      where: {
        userId: req.user!.id,
      },
      select: {
        id: true,
        name: true,
        transports: true,
        lastUsed: true,
        createdAt: true,
      },
    });
  },
});
