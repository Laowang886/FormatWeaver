import { NextRequest, NextResponse } from "next/server";
import { getJobsQueue } from "@/lib/job-queue";
import { fileExists, readJobFile } from "@/lib/job-storage";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const p = await context.params;
  const id = p.id;

  const job = await getJobsQueue().getJob(id);
  if (!job) {
    return NextResponse.json({ message: "job not found" }, { status: 404 });
  }

  const result = job.returnvalue as
    | {
        outputFileName?: string;
        outputMimeType?: string;
        outputFilePath?: string;
        outputStorageKey?: string;
      }
    | undefined;

  const filePath = result?.outputFilePath;
  const storageKey = result?.outputStorageKey;
  const fileName = result?.outputFileName ?? `formatweaver-result-${id}.txt`;
  const mimeType = result?.outputMimeType ?? "application/octet-stream";

  if (!filePath && !storageKey) {
    return NextResponse.json(
      { message: "generated file not found" },
      { status: 404 },
    );
  }

  if (filePath && !storageKey && !(await fileExists(filePath))) {
    return NextResponse.json(
      { message: "generated file not found" },
      { status: 404 },
    );
  }

  const content = await readJobFile(filePath ?? "", storageKey);
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
