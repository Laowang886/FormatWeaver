export type HistoryRecord = {
  id: string;
  fileName: string;
  sourceFormat: string;
  targetFormat: string;
  conversionType: string;
  status: "completed" | "failed" | "processing";
  createdAt: string;
  downloadUrl: string;
};

const historyStatuses = ["completed", "failed", "processing"] as const;

function isHistoryRecord(value: unknown): value is HistoryRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.fileName === "string" &&
    typeof record.sourceFormat === "string" &&
    typeof record.targetFormat === "string" &&
    typeof record.conversionType === "string" &&
    typeof record.status === "string" &&
    historyStatuses.some((status) => status === record.status) &&
    typeof record.createdAt === "string" &&
    record.downloadUrl === `/api/jobs/${record.id}/download`
  );
}

type HistoryFetch = (input: string) => Promise<Response>;

export async function fetchHistoryRecords(
  fetcher: HistoryFetch = fetch,
): Promise<HistoryRecord[]> {
  try {
    const response = await fetcher("/api/jobs");
    if (!response.ok) return [];

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object") return [];

    const jobs = Reflect.get(payload, "jobs");
    return Array.isArray(jobs) ? jobs.filter(isHistoryRecord) : [];
  } catch {
    return [];
  }
}
