import fp from "fastify-plugin";
import {
  Counter,
  Gauge,
  Registry,
  Summary
} from "prom-client";
import { success } from "../utils/logger";

declare module "fastify" {
  interface FastifyInstance {
    registry: Registry;
    metrics: {
      errors: Counter;
      requests: Counter;
      requestTime: Summary;
      sessions: Gauge;
      emailsSent: Counter;
      ipRequests: Counter;
    };
  }
}

export const metricsPlugin = fp(async (fastify, options) => {
  const registry = new Registry();

  success("Initialized metrics");

  const metrics = {
    errors: new Counter({
      name: "permafrost_error_count",
      help: "Number of errors",
      registers: [registry],
      labelNames: ["path", "method"],
    }),
    requests: new Counter({
      name: "permafrost_request_count",
      help: "Number of requests",
      registers: [registry],
      labelNames: ["path", "method"],
    }),
    ipRequests: new Counter({
      name: "permafrost_ip_request_count",
      help: "Number of requests",
      registers: [registry],
      labelNames: ["ip"],
    }),
    requestTime: new Summary({
      name: "permafrost_request_time",
      help: "Request time",
      registers: [registry],
    }),
    sessions: new Gauge({
      name: "permafrost_sessions_count",
      help: "Number of active sessions",
      registers: [registry],
    }),
    emailsSent: new Counter({
      name: "permafrost_emails_sent_count",
      help: "Number of emails sent",
      registers: [registry],
    }),
  };

  await fastify.prisma.session.count().then((count) => {
    metrics.sessions.set(count);
  });

  fastify.decorate("metrics", metrics);
  fastify.decorate("registry", registry);

  fastify.addHook("onRequest", (req, res, done) => {
    metrics.ipRequests.inc({ ip: req.ip });
    done();
  });

  fastify.addHook("onResponse", (req, res, done) => {
    if (res.statusCode >= 500 && res.statusCode < 600) {
      metrics.errors.inc({ path: req.url, method: req.method });
    }

    metrics.requestTime.observe(res.elapsedTime);
    done();
  });
});
