export type ConversionMetadata = {
  sourceFormat: "pdf" | "docx";
  targetFormat: "pdf" | "docx";
  conversionType: "pdf-to-docx" | "docx-to-pdf";
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

const conversions: Record<
  ConversionMetadata["conversionType"],
  ConversionMetadata
> = {
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
};

export function getConversionMetadata(value: FormDataEntryValue | null) {
  return typeof value === "string" && value in conversions
    ? conversions[value as ConversionMetadata["conversionType"]]
    : null;
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

    return getConversionMetadata(conversionType);
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

  const id = String(job.id);

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
