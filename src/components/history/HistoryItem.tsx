import HistoryStatusBadge from "@/components/history/HistoryStatusBadge";
import type { HistoryRecord } from "@/lib/history";

type HistoryItemProps = {
  record: HistoryRecord;
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

export default function HistoryItem({ record }: HistoryItemProps) {
  return (
    <li className="rounded-2xl bg-slate-900/80 p-5 ring-1 ring-white/5">
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
          {record.status === "completed" && record.downloadUrl ? (
            <a
              href={record.downloadUrl}
              download
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400"
            >
              Download
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-500"
            >
              Download
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
