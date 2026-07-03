"use client";

import { useEffect, useState } from "react";

type Job = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress?: number;
  downloadUrl?: string;
  error?: string;
};

export default function JobStatusPanel({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) return;
        const j = await res.json();
        if (mounted) setJob(j);
      } catch {}
    };

    fetchStatus();
    const id = setInterval(fetchStatus, 1200);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [jobId]);

  if (!job)
    return <div className="text-sm text-slate-400">Checking job status…</div>;

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-white">Status: {job.status}</div>
      {job.progress !== undefined && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-2 bg-sky-500"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      )}

      {job.status === "completed" && job.downloadUrl && (
        <a
          href={job.downloadUrl}
          className="inline-block rounded-md bg-emerald-500 px-4 py-2 text-sm text-white"
        >
          Download result
        </a>
      )}

      {job.status === "failed" && (
        <div className="rounded-md bg-rose-500/10 p-3 text-sm text-rose-200">
          {job.error ?? "Conversion failed"}
        </div>
      )}
    </div>
  );
}
