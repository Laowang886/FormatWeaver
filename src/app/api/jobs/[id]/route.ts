import { NextRequest, NextResponse } from "next/server";
import { getJobsQueue } from "@/lib/job-queue";
import type { JobStatusResponse } from "@/lib/job-types";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const p = await context.params;
  const id = p.id;

  const queue = getJobsQueue();
  const job = await queue.getJob(id);

  if (job) {
    const state = await job.getState();
    const result = job.returnvalue as
      | {
          outputFileName?: string;
          outputMimeType?: string;
          outputFilePath?: string;
        }
      | undefined;

    const response: JobStatusResponse = {
      id: job.id ?? id,
      type: job.data.type,
      status: mapState(state),
      progress: Number(job.progress ?? 0),
      createdAt: job.data.createdAt,
      files: job.data.files,
      options: job.data.options,
      error:
        state === "failed" ? (job.failedReason ?? "Job failed") : undefined,
      downloadUrl:
        state === "completed" && result?.outputFileName
          ? `/api/jobs/${job.id}/download`
          : undefined,
      outputFileName: result?.outputFileName,
      outputMimeType: result?.outputMimeType,
    };

    return NextResponse.json(response);
  }

  return NextResponse.json({ message: "job not found" }, { status: 404 });
}

function mapState(state: string): JobStatusResponse["status"] {
  if (state === "completed") return "completed";
  if (state === "failed") return "failed";
  if (state === "active") return "processing";
  if (state === "waiting" || state === "delayed" || state === "paused") {
    return "queued";
  }
  return "queued";
}
