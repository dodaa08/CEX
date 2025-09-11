import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error", err);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected...");
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
    process.exit(1);
  }
};