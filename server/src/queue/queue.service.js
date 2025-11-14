import { Queue } from "bullmq";
import IORedis from "ioredis";
import config from "../config/config.js";

const connectionOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  username: config.REDIS_USERNAME,
  password: config.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

const connection = new IORedis(connectionOptions);

export const jobQueue = new Queue(config.QUEUE_NAME, { connection });

export async function enqueueFeed(url) {
  return jobQueue.add(
    "import-feed",
    { url },
    {
      attempts: config.JOB_ATTEMPTS,
      backoff: { type: "exponential", delay: config.JOB_BACKOFF_MS },
      removeOnComplete: true,
    }
  );
}
