import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  DEFAULT_CONVERSION_OPTIONS,
  type ConversionOptionsState,
  type ConversionType,
} from "@/components/converter/conversion-types";
import { getJobsQueue } from "@/lib/job-queue";
import { saveUploadFiles } from "@/lib/job-storage";
import type { JobPayload } from "@/lib/job-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const type = form.get("type") as ConversionType | null;
  const optionsRaw = form.get("options");
  const files = form.getAll("files");
  const singleFile = form.get("file");

  const inputFiles = files.filter((item): item is File => item instanceof File);
  if (inputFiles.length === 0 && singleFile instanceof File) {
    inputFiles.push(singleFile);
  }

  if (!type || inputFiles.length === 0) {
    return NextResponse.json(
      { message: "type and file required" },
      { status: 400 },
    );
  }

  const parsedOptions = parseOptions(optionsRaw);
  const id = randomUUID();
  const savedFiles = await saveUploadFiles(id, inputFiles);
  const payload: JobPayload = {
    type,
    options: parsedOptions,
    files: savedFiles,
    createdAt: new Date().toISOString(),
  };

  const queue = getJobsQueue();
  await queue.add("convert", payload, {
    jobId: id,
    removeOnComplete: false,
    removeOnFail: false,
  });

  return NextResponse.json({ jobId: id });
}

function parseOptions(optionsRaw: FormDataEntryValue | null) {
  if (typeof optionsRaw !== "string" || !optionsRaw.trim()) {
    return DEFAULT_CONVERSION_OPTIONS;
  }

  try {
    const parsed = JSON.parse(optionsRaw) as Partial<ConversionOptionsState>;
    return {
      pageRange: parsed.pageRange ?? DEFAULT_CONVERSION_OPTIONS.pageRange,
      compressionQuality:
        parsed.compressionQuality ??
        DEFAULT_CONVERSION_OPTIONS.compressionQuality,
      targetFormat:
        parsed.targetFormat ?? DEFAULT_CONVERSION_OPTIONS.targetFormat,
      mergeOrder: parsed.mergeOrder ?? DEFAULT_CONVERSION_OPTIONS.mergeOrder,
    };
  } catch {
    return DEFAULT_CONVERSION_OPTIONS;
  }
}
