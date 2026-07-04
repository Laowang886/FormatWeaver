import { Worker } from "bullmq";
import { getJobsQueueName, getRedisConnectionOptions } from "@/lib/job-queue";
import { processJobConversion } from "@/lib/job-processing";
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
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  const shutdown = async () => {
    await worker.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void main();
