import express from "express";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";

import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import { absenceRouter } from "./routes/absence.routes";
import { gradeRouter } from "./routes/grade.routes";
import { healthRouter } from "./routes/health.routes";
import { subjectRouter } from "./routes/subject.routes";
import { tagRouter } from "./routes/tag.routes";

const app = express();

const sanitizeBodyForLog = (body: unknown): unknown => {
  if (!body || typeof body !== "object") {
    return body;
  }

  const typedBody = body as Record<string, unknown>;

  return Object.entries(typedBody).reduce<Record<string, unknown>>(
    (accumulator, [key, value]) => {
      const normalizedKey = key.toLowerCase();
      const isSensitiveField =
        normalizedKey.includes("password") ||
        normalizedKey.includes("token") ||
        normalizedKey.includes("secret");

      accumulator[key] = isSensitiveField ? "[REDACTED]" : value;

      return accumulator;
    },
    {},
  );
};

const httpDebugLogger = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const startedAt = Date.now();

  response.on("finish", () => {
    const elapsedMs = Date.now() - startedAt;
    const shouldLogAsWarn = response.statusCode >= 400;
    const log = shouldLogAsWarn ? console.warn : console.log;

    log(
      `[HTTP] ${request.method} ${request.originalUrl} -> ${response.statusCode} (${elapsedMs}ms)`,
      {
        query: request.query,
        body: sanitizeBodyForLog(request.body),
        hasAuthorizationHeader: Boolean(request.header("Authorization")),
      },
    );
  });

  next();
};

const allowedOrigins = [
  "http://localhost:5173",
  "https://attendash.site",
  "https://www.attendash.site",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(httpDebugLogger);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(healthRouter);
app.use("/api", subjectRouter);
app.use("/api", gradeRouter);
app.use("/api", absenceRouter);
app.use("/api/tags", tagRouter);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running at http://localhost:${env.port}`);
});
