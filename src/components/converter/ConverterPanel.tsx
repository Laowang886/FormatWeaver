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

const MAX_DIRECT_UPLOAD_BYTES = 3 * 1024 * 1024;

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

  const setSelectedFiles = (nextFiles: File[]) => {
    setJobId(null);
    setError(null);

    if (!config.allowMultipleFiles) {
      setFiles(nextFiles.slice(0, 1));
      return;
    }

    setFiles((currentFiles) => {
      const filesByKey = new Map(
        currentFiles.map((file) => [
          `${file.name}-${file.size}-${file.lastModified}`,
          file,
        ]),
      );

      nextFiles.forEach((file) => {
        filesByKey.set(`${file.name}-${file.size}-${file.lastModified}`, file);
      });

      return Array.from(filesByKey.values());
    });
  };

  const submit = async () => {
    if (files.length === 0) return setError("Choose a file first");
    const totalUploadSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalUploadSize > MAX_DIRECT_UPLOAD_BYTES) {
      return setError("Direct demo mode supports uploads up to 3 MB.");
    }

    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("options", JSON.stringify(options));
      files.forEach((file) => fd.append("files", file, file.name));

      const res = await fetch("/api/jobs", { method: "POST", body: fd });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message =
          payload && typeof payload.message === "string"
            ? payload.message
            : "Failed to create job";
        throw new Error(message);
      }
      const { jobId } = await res.json();
      setJobId(jobId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220] shadow-2xl shadow-black/15">
        <div className="border-b border-slate-800 p-5 sm:p-6">
          <ConversionTypeSelector value={type} onChange={setConversionType} />
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <FileDropzone
            accept={config.accept}
            title={config.uploadTitle}
            subtitle={config.uploadSubtitle}
            multiple={config.allowMultipleFiles}
            onFiles={setSelectedFiles}
          />

          {files.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
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
              <ul className="divide-y divide-slate-800 text-sm">
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
            <div className="rounded-xl border border-rose-400/25 bg-rose-500/10 p-3 text-sm text-rose-100">
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
