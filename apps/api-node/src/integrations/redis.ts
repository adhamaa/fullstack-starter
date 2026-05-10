import { Redis } from "ioredis";
import { env } from "../env.js";

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1
});

export async function checkRedis() {
  if (redis.status === "end" || redis.status === "close") {
    await redis.connect();
  }

  await redis.ping();
}
