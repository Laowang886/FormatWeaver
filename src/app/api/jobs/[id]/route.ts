import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getJobsQueue } from "@/lib/job-queue";
import { parseDatabaseJobId, type JobStatusResponse } from "@/lib/job-types";
import { jobs, users } from "@/lib/schema";

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

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const jobId = parseDatabaseJobId(id);
  if (jobId === null) {
    return NextResponse.json({ message: "Invalid job ID." }, { status: 400 });
  }

  try {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [deletedJob] = await db
      .delete(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, user.id)))
      .returning({ id: jobs.id });

    if (!deletedJob) {
      return NextResponse.json(
        { message: "Conversion record not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("History deletion failed", error);
    return NextResponse.json(
      { message: "Unable to delete conversion record." },
      { status: 500 },
    );
  }
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
