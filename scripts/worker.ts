import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getJobsQueueName, getRedisConnectionOptions } from "@/lib/job-queue";
import { processJobConversion } from "@/lib/job-processing";
import { jobs } from "@/lib/schema";
import type { JobPayload } from "@/lib/job-types";

async function main() {
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
    await db
      .update(jobs)
      .set({ status, updatedAt: new Date() })
      .where(eq(jobs.id, payload.databaseJobId));
  } catch (error) {
    console.error(`Job ${payload.databaseJobId} history update failed`, error);
  }
}

void main();
