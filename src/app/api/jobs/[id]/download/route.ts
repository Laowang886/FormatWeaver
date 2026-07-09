import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { getJobsQueue } from "@/lib/job-queue";
import { fileExists, readDirectJobRecord } from "@/lib/job-storage";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const p = await context.params;
  const id = p.id;

  const directJob = await readDirectJobRecord(id);
  if (directJob) {
    return sendFile({
      filePath: directJob.outputFilePath,
      fileName: directJob.outputFileName ?? `formatweaver-result-${id}.txt`,
      mimeType: directJob.outputMimeType ?? "application/octet-stream",
    });
  }

  const job = process.env.REDIS_URL
    ? await getJobsQueue().getJob(id)
    : undefined;
  if (!job) {
    return NextResponse.json({ message: "job not found" }, { status: 404 });
  }

  const result = job.returnvalue as
    | {
        outputFileName?: string;
        outputMimeType?: string;
        outputFilePath?: string;
      }
    | undefined;

  const filePath = result?.outputFilePath;
  const fileName = result?.outputFileName ?? `formatweaver-result-${id}.txt`;
  const mimeType = result?.outputMimeType ?? "application/octet-stream";

  return sendFile({ filePath, fileName, mimeType });
}

async function sendFile({
  filePath,
  fileName,
  mimeType,
}: {
  filePath: string | undefined;
  fileName: string;
  mimeType: string;
}) {
  if (!filePath || !(await fileExists(filePath))) {
    return NextResponse.json(
      { message: "generated file not found" },
      { status: 404 },
    );
  }

  const content = await fs.readFile(filePath);
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
