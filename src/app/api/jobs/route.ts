import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  DEFAULT_CONVERSION_OPTIONS,
  type ConversionOptionsState,
  type ConversionType,
} from "@/components/converter/conversion-types";
import { db } from "@/lib/db";
import {
  encodeConversionMetadata,
  getConversionMetadata,
  historyRecordFromJob,
} from "@/lib/job-history-metadata";
import { getJobsQueue } from "@/lib/job-queue";
import { saveUploadFiles } from "@/lib/job-storage";
import { databaseJobQueueId, type JobPayload } from "@/lib/job-types";
import { jobs, users } from "@/lib/schema";

export const runtime = "nodejs";

async function findUserIdByEmail(email: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user?.id ?? null;
}

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = await findUserIdByEmail(email);
    if (!userId) return NextResponse.json({ jobs: [] });

    const databaseJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        status: jobs.status,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(eq(jobs.userId, userId))
      .orderBy(desc(jobs.createdAt));

    return NextResponse.json({
      jobs: databaseJobs.flatMap((job) => {
        const record = historyRecordFromJob(job);
        return record ? [record] : [];
      }),
    });
  } catch (error) {
    console.error("History lookup failed", error);
    return NextResponse.json(
      { message: "Unable to load conversion history." },
      { status: 500 },
    );
  }
}

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

  if (
    !type ||
    inputFiles.length === 0 ||
    inputFiles.some((file) => file.size === 0)
  ) {
    return NextResponse.json(
      { message: "A valid type and source file are required." },
      { status: 400 },
    );
  }

  const parsedOptions = parseOptions(optionsRaw);
  const session = await auth();
  const databaseJobId = await createHistoryJob(
    session?.user?.email,
    type,
    inputFiles,
  );
  const id =
    databaseJobId === null ? randomUUID() : databaseJobQueueId(databaseJobId);
  const savedFiles = await saveUploadFiles(id, inputFiles);
  const payload: JobPayload = {
    type,
    options: parsedOptions,
    files: savedFiles,
    createdAt: new Date().toISOString(),
    databaseJobId,
  };

  const queue = getJobsQueue();
  await queue.add("convert", payload, {
    jobId: id,
    removeOnComplete: false,
    removeOnFail: false,
  });

  return NextResponse.json({ jobId: id });
}

async function createHistoryJob(
  email: string | null | undefined,
  type: ConversionType,
  inputFiles: File[],
) {
  if (!email) return null;

  try {
    const userId = await findUserIdByEmail(email);
    if (!userId) return null;

    const [firstFile] = inputFiles;
    const metadata = getConversionMetadata(type, firstFile.name);
    if (!metadata) return null;

    const [databaseJob] = await db
      .insert(jobs)
      .values({
        userId,
        title:
          inputFiles.length === 1
            ? firstFile.name
            : `${firstFile.name} and ${inputFiles.length - 1} more`,
        description: encodeConversionMetadata(metadata),
        status: "queued",
      })
      .returning({ id: jobs.id });

    return databaseJob.id;
  } catch (error) {
    console.error("Job history creation failed", error);
    return null;
  }
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
