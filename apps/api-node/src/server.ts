import cors from "cors";
import express from "express";
import { env } from "./env.js";
import { checkMySql } from "./integrations/mysql.js";
import { getNovuStatus } from "./integrations/novu.js";
import { checkRedis } from "./integrations/redis.js";
import { checkS3 } from "./integrations/s3.js";
import { requireAuth } from "./integrations/keycloak.js";

const app = express();

app.use(cors());
app.use(express.json());

async function dependencyStatus(check: () => Promise<void>) {
  try {
    await check();
    return "ok" as const;
  } catch {
    return "error" as const;
  }
}

app.get("/health", async (_request, response) => {
  const dependencies = {
    mysql: await dependencyStatus(checkMySql),
    redis: await dependencyStatus(checkRedis),
    s3: await dependencyStatus(checkS3),
    novu: getNovuStatus()
  };

  const status = {
    service: "api-node",
    status: Object.values(dependencies).every((value) => value === "ok") ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    dependencies
  };

  response.json(status);
});

app.get("/health/flask", async (_request, response) => {
  const flaskResponse = await fetch(`${env.FLASK_API_URL}/health`);
  response.status(flaskResponse.status).json(await flaskResponse.json());
});

app.get("/me", requireAuth, (_request, response) => {
  response.json({ user: response.locals.user });
});

app.listen(env.NODE_API_PORT, () => {
  console.log(`Node API listening on http://localhost:${env.NODE_API_PORT}`);
});
