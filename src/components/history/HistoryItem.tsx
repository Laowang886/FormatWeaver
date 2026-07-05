import HistoryStatusBadge from "@/components/history/HistoryStatusBadge";
import type { HistoryRecord } from "@/lib/history";

type HistoryItemProps = {
  record: HistoryRecord;
  deleteDisabled: boolean;
  isDeleting: boolean;
  onDelete: (recordId: string) => void;
};

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  return Number.isNaN(date.getTime())
    ? createdAt
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function HistoryItem({
  record,
  deleteDisabled,
  isDeleting,
  onDelete,
}: HistoryItemProps) {
  return (
    <li className="rounded-xl border border-slate-800 bg-[#0b1220] p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{record.fileName}</p>
          <p className="mt-1 text-sm text-slate-400">
            {record.conversionType ||
              `${record.sourceFormat} to ${record.targetFormat}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:justify-end">
          <HistoryStatusBadge status={record.status} />
          <time dateTime={record.createdAt} className="text-sm text-slate-400">
            {formatCreatedAt(record.createdAt)}
          </time>
          <div className="flex items-center gap-2">
            {record.status === "completed" && record.downloadUrl ? (
              <a
                href={record.downloadUrl}
                download
                className="inline-flex items-center justify-center rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Download
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-500"
              >
                Download
              </button>
            )}
            <button
              type="button"
              disabled={deleteDisabled}
              onClick={() => onDelete(record.id)}
              className="inline-flex items-center justify-center rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
