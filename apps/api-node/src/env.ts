import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_API_PORT: z.coerce.number().default(4000),
  FLASK_API_URL: z.string().url().default("http://localhost:5000"),
  DATABASE_URL: z.string().default("mysql://app:app_password@localhost:3306/app_db"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  S3_ENDPOINT: z.string().url().default("http://localhost:9000"),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("app-local"),
  S3_ACCESS_KEY_ID: z.string().default("minioadmin"),
  S3_SECRET_ACCESS_KEY: z.string().default("minioadmin"),
  NOVU_SECRET_KEY: z.string().optional(),
  KEYCLOAK_ISSUER: z.string().url().default("http://localhost:8080/realms/fullstack"),
  KEYCLOAK_AUDIENCE: z.string().default("fullstack-api")
});

export const env = envSchema.parse(process.env);
