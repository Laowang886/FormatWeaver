import { NextResponse, NextRequest } from "next/server";

type JobStatus = "queued" | "processing" | "completed" | "failed";

type JobRecord = {
  id: string;
  status: JobStatus;
  progress: number;
  type: string;
  filename: string;
  downloadUrl?: string;
};

declare global {
  var __FORMATWEAVER_JOBS__: Record<string, JobRecord> | undefined;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const p = await context.params;
  const id = p.id;

  const jobs = globalThis.__FORMATWEAVER_JOBS__;
  if (jobs?.[id]) {
    return NextResponse.json(jobs[id]);
  }

  return NextResponse.json({ message: "job not found" }, { status: 404 });
}
