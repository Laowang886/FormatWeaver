import type {
  ConversionOptionsState,
  ConversionType,
  MergeOrder,
  TargetImageFormat,
} from "@/components/converter/conversion-types";

export type JobInputFile = {
  originalName: string;
  storedName: string;
  storedPath: string;
  mimeType: string;
  size: number;
};

export type JobOptions = ConversionOptionsState;

export type JobPayload = {
  type: ConversionType;
  options: JobOptions;
  files: JobInputFile[];
  createdAt: string;
  databaseJobId?: number | null;
};

export type JobOutputArtifact = {
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
};

export type JobOutput = {
  artifacts: JobOutputArtifact[];
  primaryArtifact: JobOutputArtifact;
  message: string;
};

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export type JobStatusResponse = {
  id: string;
  type: ConversionType;
  status: JobStatus;
  progress: number;
  error?: string;
  createdAt?: string;
  completedAt?: string;
  files: JobInputFile[];
  options: JobOptions;
  downloadUrl?: string;
  outputFileName?: string;
  outputMimeType?: string;
};

export type PdfMergeOrder = MergeOrder;
export type ImageFormat = TargetImageFormat;

export function databaseJobQueueId(databaseJobId: number) {
  return `job-${databaseJobId}`;
}

export function parseDatabaseJobId(value: string) {
  const match = /^job-([1-9]\d*)$/.exec(value) ?? /^([1-9]\d*)$/.exec(value);
  if (!match) return null;

  const id = Number(match[1]);
  return Number.isSafeInteger(id) ? id : null;
}
