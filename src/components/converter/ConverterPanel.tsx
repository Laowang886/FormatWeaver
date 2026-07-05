"use client";

import { useState } from "react";
import ConversionTypeSelector from "@/components/converter/ConversionTypeSelector";
import FileDropzone from "@/components/upload/FileDropzone";
import ConvertButton from "@/components/converter/ConvertButton";
import JobStatusPanel from "@/components/jobs/JobStatusPanel";
import {
  ConversionOptionsState,
  ConversionType,
  DEFAULT_CONVERSION_OPTIONS,
  getConversionTypeConfig,
} from "@/components/converter/conversion-types";
import ConversionOptions from "@/components/converter/ConversionOptions";

export default function ConverterPanel() {
  const [type, setType] = useState<ConversionType>("pdf-word");
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<ConversionOptionsState>(
    DEFAULT_CONVERSION_OPTIONS,
  );
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = getConversionTypeConfig(type);

  const setConversionType = (nextType: ConversionType) => {
    setType(nextType);
    setFiles([]);
    setJobId(null);
    setError(null);
    setOptions(DEFAULT_CONVERSION_OPTIONS);
  };

  const submit = async () => {
    if (files.length === 0) return setError("Choose a file first");
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("options", JSON.stringify(options));
      files.forEach((file) => fd.append("files", file, file.name));

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
    <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[360px_1fr]">
      <aside className="space-y-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
            Conversion
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Choose a tool
          </h2>
        </div>
        <ConversionTypeSelector value={type} onChange={setConversionType} />
      </aside>

      <section className="border border-white/10 bg-[#080b12]">
        <div className="border-b border-white/10 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">Current tool</p>
              <h3 className="mt-1 text-2xl font-semibold text-white">
                {config.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {config.description}
              </p>
            </div>
            <div className="border border-white/10 px-3 py-2 text-xs text-slate-300">
              {config.allowMultipleFiles ? "Multiple files" : "Single file"}
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5">
          <FileDropzone
            accept={config.accept}
            title={config.uploadTitle}
            subtitle={config.uploadSubtitle}
            multiple={config.allowMultipleFiles}
            onFiles={setFiles}
          />

          {files.length > 0 && (
            <div className="border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="font-medium text-white">Selected files</div>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-sm font-medium text-rose-300 hover:text-rose-200"
                >
                  Clear
                </button>
              </div>
              <ul className="divide-y divide-white/10 text-sm">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="grid gap-2 py-3 text-slate-300 sm:grid-cols-[36px_1fr_auto]"
                  >
                    <span className="text-slate-500">{index + 1}</span>
                    <span className="min-w-0 truncate">{file.name}</span>
                    <span className="text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ConversionOptions
            fields={config.optionFields}
            values={options}
            onChange={setOptions}
          />

          {error && (
            <div className="border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          {!jobId ? (
            <ConvertButton
              onClick={submit}
              loading={loading}
              disabled={files.length === 0}
              label={config.buttonLabel}
            />
          ) : (
            <JobStatusPanel jobId={jobId} />
          )}
        </div>
      </section>
    </div>
  );
}
