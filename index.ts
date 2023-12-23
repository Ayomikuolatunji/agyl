import { checkConfig, config } from "config/envs/config";
import { app } from "./app";
import { PrismaClient } from "@prisma/client";
import { prisma } from "config/prisma-client";
import { redisClient } from "config/redis-client";

class CreateDBConnect {
  db: PrismaClient;
  constructor() {
    this.db = prisma;
  }
  async connect() {
    try {
      checkConfig();
      await this.db.$connect();
      console.log("Connected to database successfully");

      await redisClient
        .connect()
        .then(() => {
          console.log("Redis client is ready and connected.");
        })
        .catch((err) => {
          console.error("Redis connection error:", err);
        });
      app.listen(config.server.PORT, () =>
        console.log(`Server started on port ${config.server.PORT}`)
      );
    } catch (error: any) {
      console.error("Failed to connect to database", error.message);
      this.disconnect();
    }
  }
  async disconnect() {
    await this.db.$disconnect();
  }
}
new CreateDBConnect().connect();
