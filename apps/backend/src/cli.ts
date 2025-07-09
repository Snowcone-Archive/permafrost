import { AccountPermissions, PrismaClient } from "@prisma/client";
import { defineCommand, runMain } from "citty";
import { randomBytes } from "crypto";
import { TOTP } from "otpauth";
import path from "path";
import meta from "./meta";
import { hashPassword } from "./utils/auth";
import { debug, error, success, warn } from "./utils/logger";

const main = defineCommand({
  meta: {
    name: "PermafrostCLI",
    version: meta.version.toString(),
    description: "Utility tool when developing and debugging PermafrostID",
  },
  subCommands: {
    "2fa": {
      meta: {
        name: "2fa",
        description: "Tests 2FA secrets!",
      },
      args: {
        secret: {
          type: "positional",
          required: true,
          description: "The 2FA secret to generate codes for",
        },
      },
      run: (cmd) => {
        const totp = new TOTP({
          issuer: "SnowflakePermafrost",
          label: "Permafrost",
          algorithm: "SHA1",
          digits: 6,
          period: 30,
          secret: cmd.args.secret,
        });

        const draw = () => {
          console.clear();
          console.log(totp.generate());
        };

        setInterval(draw, 1000);
      },
    },
    hash: {
      meta: {
        name: "hash",
        description: "Tests password hashing!",
      },
      args: {
        content: {
          type: "positional",
          required: true,
          description: "The string to hash",
        },
      },
      run: async (cmd) => {
        console.log("Hash:", await hashPassword(cmd.args.content));
      },
    },
    keygen: {
      meta: {
        name: "keygen",
        description: "Generates and saves a users JWT secret",
      },
      args: {
        force: {
          type: "boolean",
          description: "If it should overwrite the key when it already exists.",
        },
        size: {
          type: "number",
          description: "Secret size, defaults to 2048.",
        },
      },
      run: async (cmd) => {
        const keyfile = Bun.file(path.join(__dirname, "../users.pem"));

        if (keyfile.size > 0 && !cmd.args.force && !cmd.args.f) {
          error(
            "File already exists. For security reasons please delete it first, or use the -f flag."
          );

          process.exit(1);
        }

        const key = randomBytes(cmd.args.size || 2048);
        await Bun.write(keyfile, key);

        success("Successfully wrote keyfile");
      },
    },
    user: {
      subCommands: {
        create: {
          meta: {
            name: "user create",
            description: "Creates a user",
          },
          args: {
            username: {
              type: "positional",
              required: true,
            },
            email: {
              type: "positional",
              required: true,
            },
            admin: {
              type: "boolean",
            },
            usePassword: {
              type: "boolean",
              description: "Allows login with the randomly generated password.",
            },
            super: {
              type: "boolean",
              description: "Makes the user a superadmin",
            },
          },
          run: async (cmd) => {
            console.log(cmd.args);
            await createUser(
              cmd.args.username,
              cmd.args.email,
              !!cmd.args.admin,
              !!cmd.args.super,
              !!cmd.args.usePassword
            );
          },
        },
        password: {
          meta: {
            name: "user password",
            description: "Utilities around managing users passwords",
          },
          subCommands: {
            update: {
              meta: {
                name: "user password update",
                description: "Updates a user's password",
              },
              args: {
                identifier: {
                  type: "positional",
                  required: true,
                  description:
                    "Identifier for the user to update password for. Can be username, email or ID.",
                },
                newPassword: {
                  type: "positional",
                  required: true,
                  description: "The new password, in plaintext",
                },
              },
              run: async (cmd) => {
                warn(
                  "This command should only be used for debugging. The user should reset their password themself. The new password is logged in plaintext on this device."
                );

                const prisma = await getPrisma();

                // Due to prisma limitations a findFirst is used instead of unique.
                const user = await prisma.user.findFirst({
                  where: {
                    OR: [
                      {
                        id: cmd.args.identifier,
                      },
                      {
                        email: cmd.args.identifier,
                      },
                      {
                        username: cmd.args.identifier,
                      },
                    ],
                  },
                  select: {
                    id: true,
                    email: true,
                    username: true,
                  },
                });

                if (!user) {
                  error("User not found!");
                  process.exit(1);
                }

                debug("Updating user password");

                await prisma.user.update({
                  where: {
                    id: user.id,
                  },
                  data: {
                    password: await hashPassword(cmd.args.newPassword),
                  },
                });

                success(
                  `Updated user password for ${user.email} "@${user.username}".`
                );
              },
            },
          },
        },
      },
    },
  },
});

async function getPrisma() {
  const prisma = new PrismaClient();
  debug("Connecting to database...");
  await prisma.$connect();
  debug("Connected to database!");
  return prisma;
}

async function createUser(
  name: string,
  email: string,
  admin: boolean,
  superAdmin: boolean,
  usePassword: boolean
) {
  const prisma = await getPrisma();
  const password = crypto.randomUUID();
  const permissions: AccountPermissions[] = [];

  if (superAdmin || admin) {
    permissions.push("Administrator", "CreateApplication");
    if (superAdmin) permissions.push("SuperAdministrator");
  }

  debug("Creating user...");

  const user = await prisma.user.create({
    data: {
      username: name.toLowerCase(),
      email,
      password: await hashPassword(password),
      flags: usePassword ? undefined : ["RequiresPasswordChange"],
      permissions: permissions || undefined,
    },
  });

  success(
    `Created ${
      user.permissions.includes("Administrator") ? "administrator" : "user"
    }! ${
      user.flags.includes("RequiresPasswordChange")
        ? "They will have to reset their password before they can login."
        : "WARNING: They will be able to login with the password " + password
    } `
  );
}

await runMain(main);
