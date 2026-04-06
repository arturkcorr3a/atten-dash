import express from "express";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import { absenceRouter } from "./routes/absence.routes";
import { gradeRouter } from "./routes/grade.routes";
import { healthRouter } from "./routes/health.routes";
import { subjectRouter } from "./routes/subject.routes";

const app = express();

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(healthRouter);
app.use("/api", subjectRouter);
app.use("/api", gradeRouter);
app.use("/api", absenceRouter);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running at http://localhost:${env.port}`);
});
