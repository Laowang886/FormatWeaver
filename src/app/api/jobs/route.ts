import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

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

// In-memory jobs store for demo purposes
const JOBS: Record<string, JobRecord> = globalThis.__FORMATWEAVER_JOBS__ ?? {};
globalThis.__FORMATWEAVER_JOBS__ = JOBS;

export async function POST(request: Request) {
  const form = await request.formData();
  const type = form.get("type") as string | null;
  const file = form.get("file");

  if (!type || !(file instanceof File)) {
    return NextResponse.json(
      { message: "type and file required" },
      { status: 400 },
    );
  }

  const id = randomUUID();
  JOBS[id] = { id, status: "queued", progress: 0, type, filename: file.name };

  // keep global reference for other route modules
  globalThis.__FORMATWEAVER_JOBS__ = JOBS;

  // simulate async processing
  setTimeout(() => startProcessing(id), 500);

  return NextResponse.json({ jobId: id });
}

function startProcessing(id: string) {
  const job = JOBS[id];
  if (!job) return;
  job.status = "processing";
  let p = 0;
  const t = setInterval(() => {
    p += 15 + Math.floor(Math.random() * 10);
    job.progress = Math.min(100, p);
    if (job.progress >= 100) {
      job.status = "completed";
      job.downloadUrl = `/api/jobs/${id}/download`;
      clearInterval(t);
    }
  }, 700);
}
