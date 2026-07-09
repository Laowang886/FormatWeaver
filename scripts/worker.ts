import { Worker } from "bullmq";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import type { JobPayload } from "@/lib/job-types";

dotenv.config({ path: ".env.local" });

async function main() {
  const { getJobsQueueName, getRedisConnectionOptions } =
    await import("@/lib/job-queue");
  const { processJobConversion } = await import("@/lib/job-processing");

  const worker = new Worker(
    getJobsQueueName(),
    async (job) => {
      const payload = job.data as JobPayload;
      await job.updateProgress(10);

      const result = await processJobConversion({
        jobId: job.id ?? payload.createdAt,
        type: payload.type,
        options: payload.options,
        files: payload.files,
      });

      await job.updateProgress(100);
      return {
        ...result,
        outputFileName: result.primaryArtifact.fileName,
        outputMimeType: result.primaryArtifact.mimeType,
        outputFilePath: result.primaryArtifact.filePath,
        outputStorageKey: result.primaryArtifact.storageKey,
      };
    },
    {
      connection: getRedisConnectionOptions(),
      concurrency: 2,
    },
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed.`);
    void updateHistoryStatus(job.data as JobPayload, "completed");
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
    if (job) void updateHistoryStatus(job.data as JobPayload, "failed");
  });

  const shutdown = async () => {
    await worker.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function updateHistoryStatus(
  payload: JobPayload,
  status: "completed" | "failed",
) {
  if (payload.databaseJobId === null || payload.databaseJobId === undefined) {
    return;
  }

  try {
    const [{ db }, { jobs }] = await Promise.all([
      import("@/lib/db"),
      import("@/lib/schema"),
    ]);

    await db
      .update(jobs)
      .set({ status, updatedAt: new Date() })
      .where(eq(jobs.id, payload.databaseJobId));
  } catch (error) {
    console.error(`Job ${payload.databaseJobId} history update failed`, error);
  }
}

void main();
