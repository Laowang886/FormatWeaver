"use client";

import { useState } from "react";
import ConversionTypeSelector from "@/components/converter/ConversionTypeSelector";
import FileDropzone from "@/components/upload/FileDropzone";
import ConvertButton from "@/components/converter/ConvertButton";
import JobStatusPanel from "@/components/jobs/JobStatusPanel";

export default function ConverterPanel() {
  const [type, setType] = useState<string>("pdf-to-docx");
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = type === "pdf-to-docx" ? ".pdf" : ".docx";

  const submit = async () => {
    if (!file) return setError("Choose a file first");
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("file", file, file.name);

      const res = await fetch("/api/jobs", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Failed to create job");
      const { jobId } = await res.json();
      setJobId(jobId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <ConversionTypeSelector value={type} onChange={setType} />

      <div>
        <div className="mb-2 text-sm text-slate-300">Upload</div>
        <FileDropzone accept={accept} onFile={setFile} />
      </div>

      {file && (
        <div className="rounded-xl bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">{file.name}</div>
              <div className="text-sm text-slate-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-rose-400"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {error && <div className="text-sm text-rose-400">{error}</div>}

      {!jobId ? (
        <ConvertButton
          onClick={submit}
          loading={loading}
          disabled={!file}
          label={type === "pdf-to-docx" ? "Convert to DOCX" : "Convert to PDF"}
        />
      ) : (
        <JobStatusPanel jobId={jobId} />
      )}
    </div>
  );
}
