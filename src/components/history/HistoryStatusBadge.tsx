import type { HistoryRecord } from "@/lib/history";

type HistoryStatusBadgeProps = {
  status: HistoryRecord["status"];
};

const statusStyles: Record<HistoryRecord["status"], string> = {
  completed: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
  failed: "bg-rose-500/15 text-rose-300 ring-rose-400/20",
  processing: "bg-sky-500/15 text-sky-300 ring-sky-400/20",
};

export default function HistoryStatusBadge({
  status,
}: HistoryStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ring-1 ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
