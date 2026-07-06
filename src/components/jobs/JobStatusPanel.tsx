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
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
        Checking job status...
      </div>
    );

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">Job status</div>
          <div className="mt-1 text-lg font-semibold capitalize text-white">
            {job.status}
          </div>
        </div>
        <div className="text-sm text-slate-400">{job.progress ?? 0}%</div>
      </div>
      {job.progress !== undefined && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-cyan-300 transition-all"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      )}

      {job.status === "completed" && job.downloadUrl && (
        <a
          href={job.downloadUrl}
          className="inline-block rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
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
