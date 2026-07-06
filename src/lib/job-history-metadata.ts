import type { ConversionType } from "@/components/converter/conversion-types";
import { databaseJobQueueId } from "@/lib/job-types";

export type ConversionMetadata = {
  sourceFormat: string;
  targetFormat: string;
  conversionType: string;
};

export type DatabaseHistoryJob = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  createdAt: Date;
};

export type DatabaseHistoryRecord = {
  id: string;
  fileName: string;
  sourceFormat: string;
  targetFormat: string;
  conversionType: string;
  status: "completed" | "failed" | "processing";
  createdAt: string;
  downloadUrl: string;
};

const conversions: Record<string, ConversionMetadata> = {
  "pdf-to-docx": {
    sourceFormat: "pdf",
    targetFormat: "docx",
    conversionType: "pdf-to-docx",
  },
  "docx-to-pdf": {
    sourceFormat: "docx",
    targetFormat: "pdf",
    conversionType: "docx-to-pdf",
  },
  "excel-csv": {
    sourceFormat: "xlsx",
    targetFormat: "csv",
    conversionType: "excel-csv",
  },
  "image-compress": {
    sourceFormat: "image",
    targetFormat: "image",
    conversionType: "image-compress",
  },
  "image-format": {
    sourceFormat: "image",
    targetFormat: "image",
    conversionType: "image-format",
  },
  "images-pdf": {
    sourceFormat: "image",
    targetFormat: "pdf",
    conversionType: "images-pdf",
  },
  "pdf-image": {
    sourceFormat: "pdf",
    targetFormat: "image",
    conversionType: "pdf-image",
  },
  "pdf-merge": {
    sourceFormat: "pdf",
    targetFormat: "pdf",
    conversionType: "pdf-merge",
  },
  "pdf-split": {
    sourceFormat: "pdf",
    targetFormat: "pdf",
    conversionType: "pdf-split",
  },
  "txt-pdf": {
    sourceFormat: "txt",
    targetFormat: "pdf",
    conversionType: "txt-pdf",
  },
};

export function getConversionMetadata(
  value: FormDataEntryValue | ConversionType | null,
  fileName?: string,
) {
  if (typeof value !== "string") return null;

  if (value === "pdf-word") {
    return fileName?.toLowerCase().endsWith(".docx")
      ? conversions["docx-to-pdf"]
      : conversions["pdf-to-docx"];
  }

  if (value === "word-pdf") {
    return fileName?.toLowerCase().endsWith(".pdf")
      ? conversions["pdf-to-docx"]
      : conversions["docx-to-pdf"];
  }

  return conversions[value] ?? null;
}

export function encodeConversionMetadata(metadata: ConversionMetadata) {
  return JSON.stringify(metadata);
}

function decodeConversionMetadata(description: string | null) {
  if (!description) return null;

  try {
    const value: unknown = JSON.parse(description);
    if (!value || typeof value !== "object") return null;

    const conversionType = Reflect.get(value, "conversionType");
    if (typeof conversionType !== "string") return null;

    return conversions[conversionType] ?? null;
  } catch {
    return null;
  }
}

function toHistoryStatus(status: string): DatabaseHistoryRecord["status"] {
  if (status === "completed" || status === "failed") return status;
  return "processing";
}

export function historyRecordFromJob(
  job: DatabaseHistoryJob,
): DatabaseHistoryRecord | null {
  const metadata = decodeConversionMetadata(job.description);
  if (!metadata) return null;

  const id = databaseJobQueueId(job.id);

  return {
    id,
    fileName: job.title,
    sourceFormat: metadata.sourceFormat,
    targetFormat: metadata.targetFormat,
    conversionType: metadata.conversionType,
    status: toHistoryStatus(job.status),
    createdAt: job.createdAt.toISOString(),
    downloadUrl: `/api/jobs/${id}/download`,
  };
}
