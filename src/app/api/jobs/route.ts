import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  encodeConversionMetadata,
  getConversionMetadata,
  historyRecordFromJob,
} from "@/lib/job-history-metadata";
import { jobs, users } from "@/lib/schema";

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
let JOBS: Record<string, JobRecord> = globalThis.__FORMATWEAVER_JOBS__ ?? {};
globalThis.__FORMATWEAVER_JOBS__ = JOBS;

async function findUserIdByEmail(email: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user?.id ?? null;
}

function saveInMemoryJob(job: JobRecord) {
  JOBS = { ...JOBS, [job.id]: job };
  globalThis.__FORMATWEAVER_JOBS__ = JOBS;
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
  const conversion = getConversionMetadata(form.get("type"));
  const file = form.get("file");

  if (
    !conversion ||
    !(file instanceof File) ||
    file.size === 0 ||
    file.name.length > 255 ||
    !file.name.toLowerCase().endsWith(`.${conversion.sourceFormat}`)
  ) {
    return NextResponse.json(
      { message: "A valid type and source file are required." },
      { status: 400 },
    );
  }

  const session = await auth();
  let databaseJobId: number | null = null;

  if (session?.user) {
    const email = session.user.email;
    if (!email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      const userId = await findUserIdByEmail(email);
      if (!userId) {
        return NextResponse.json(
          { message: "Unable to save conversion history." },
          { status: 500 },
        );
      }

      const [databaseJob] = await db
        .insert(jobs)
        .values({
          userId,
          title: file.name,
          description: encodeConversionMetadata(conversion),
          status: "processing",
        })
        .returning({ id: jobs.id });

      databaseJobId = databaseJob.id;
    } catch (error) {
      console.error("Job history creation failed", error);
      return NextResponse.json(
        { message: "Unable to save conversion history." },
        { status: 500 },
      );
    }
  }

  const id = databaseJobId === null ? randomUUID() : String(databaseJobId);
  saveInMemoryJob({
    id,
    status: "queued",
    progress: 0,
    type: conversion.conversionType,
    filename: file.name,
  });

  // simulate async processing
  setTimeout(() => startProcessing(id, databaseJobId), 500);

  return NextResponse.json({ jobId: id });
}

function startProcessing(id: string, databaseJobId: number | null) {
  const job = JOBS[id];
  if (!job) return;
  saveInMemoryJob({ ...job, status: "processing" });
  let p = 0;
  const t = setInterval(() => {
    p += 15 + Math.floor(Math.random() * 10);
    const progress = Math.min(100, p);
    const currentJob = JOBS[id];
    if (!currentJob) {
      clearInterval(t);
      return;
    }

    if (progress >= 100) {
      saveInMemoryJob({
        ...currentJob,
        status: "completed",
        progress,
        downloadUrl: `/api/jobs/${id}/download`,
      });
      clearInterval(t);

      if (databaseJobId !== null) {
        void db
          .update(jobs)
          .set({ status: "completed", updatedAt: new Date() })
          .where(eq(jobs.id, databaseJobId))
          .catch((error) => {
            console.error(`Job ${id} history update failed`, error);
          });
      }
      return;
    }

    saveInMemoryJob({ ...currentJob, progress });
  }, 700);
}
