import { AccountFlags } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createTransport } from "nodemailer";
import { join } from "path";
import { debug, success, warn } from "../utils/logger";

declare module "fastify" {
  interface FastifyInstance {
    mail: mailer;
  }
}

export interface mailer {
  sendMail({
    to,
    subject,
    type,
  }: {
    user?: { flags: AccountFlags[]; email: string };
    to?: string;
    subject: string;
    type:
      | "account-created"
      | "login"
      | "password-reset"
      | "verify-email"
      | "disabled"
      | "deleted";
    replacements: Record<string, string>;
  }): Promise<void>;
}

function assignFake(fastify: FastifyInstance) {
  fastify.decorate("mail", {
    async sendMail(args) {
      fastify.logger.info(
        `Email is not configured, will NOT send email to ${args.to} of type ${
          args.type
        } with replacements ${JSON.stringify(args.replacements)}`
      );
    },
  });
}

export const mailPlugin = fp(async (fastify, options) => {
  if (!fastify.config().emailHost) return assignFake(fastify);

  try {
    const transporter = createTransport({
      host: fastify.config().emailHost,
      port: fastify.config().emailPort,
      secure: fastify.config().emailSecure,
      auth: {
        user: fastify.config().emailUsername,
        pass: fastify.config().emailPassword,
      },
    });

    fastify.decorate("mail", {
      // Arguments inferred from the interface
      async sendMail(args) {
        if (!args.user && !args.to) {
          throw new Error("No recipient specified");
        }

        if (args.user?.flags.includes("RequiresEmailVerification")) return;

        let contents = await Bun.file(
          join(__dirname, `../templates/email/${args.type}.html`)
        ).text();

        Object.entries(args.replacements).forEach(([k, v]) => {
          contents = contents.replaceAll(`{{${k}}}`, v);
        });

        debug(`Sending ${args.type} email to ${args.to}`);

        fastify.metrics.emailsSent.inc();

        await transporter.sendMail({
          from: `"Permafrost" ${fastify.config().emailUsername}`,
          to: args.to || args.user!.email,
          subject: args.subject,
          html: contents,
        });
      },
    });

    success("Initialized email");
  } catch (e) {
    warn("Error while loading mailer plugin! Disabling emails...", e);
    assignFake(fastify);
  }
});
