import { Queue, QueueEvents, type ConnectionOptions } from "bullmq";

const QUEUE_NAME = "formatweaver-jobs";

declare global {
  var __FORMATWEAVER_QUEUE__: Queue | undefined;
  var __FORMATWEAVER_QUEUE_EVENTS__: QueueEvents | undefined;
}

export function getRedisConnectionOptions(): ConnectionOptions {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL is not configured");
  }

  const parsed = new URL(redisUrl);
  const port = parsed.port ? Number(parsed.port) : 6379;
  const db =
    parsed.pathname && parsed.pathname !== "/"
      ? Number(parsed.pathname.slice(1))
      : 0;

  return {
    host: parsed.hostname,
    port,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    db,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

export function getJobsQueue() {
  if (!globalThis.__FORMATWEAVER_QUEUE__) {
    globalThis.__FORMATWEAVER_QUEUE__ = new Queue(QUEUE_NAME, {
      connection: getRedisConnectionOptions(),
    });
  }

  return globalThis.__FORMATWEAVER_QUEUE__;
}

export function getJobsQueueEvents() {
  if (!globalThis.__FORMATWEAVER_QUEUE_EVENTS__) {
    globalThis.__FORMATWEAVER_QUEUE_EVENTS__ = new QueueEvents(QUEUE_NAME, {
      connection: getRedisConnectionOptions(),
    });
  }

  return globalThis.__FORMATWEAVER_QUEUE_EVENTS__;
}

export function getJobsQueueName() {
  return QUEUE_NAME;
}
