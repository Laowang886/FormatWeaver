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

type HistoryFetch = (input: string, init?: RequestInit) => Promise<Response>;

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

export async function deleteHistoryRecord(
  jobId: string,
  fetcher: HistoryFetch = fetch,
) {
  const response = await fetcher(`/api/jobs/${jobId}`, { method: "DELETE" });

  if (response.ok) return;

  let message = "Unable to delete conversion record.";

  try {
    const payload: unknown = await response.json();
    if (payload && typeof payload === "object") {
      const responseMessage = Reflect.get(payload, "message");
      if (typeof responseMessage === "string" && responseMessage) {
        message = responseMessage;
      }
    }
  } catch {
    // Keep the user-facing fallback when the response is not JSON.
  }

  throw new Error(message);
}
