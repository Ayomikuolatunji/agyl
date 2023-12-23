import * as redis from "redis";
import { config } from "./envs/config";

export const redisClient = redis.createClient({
  url: config.redis.REDIS_URL,
});
