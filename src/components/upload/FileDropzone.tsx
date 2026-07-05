"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  accept: string;
  title: string;
  subtitle: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
};

export default function FileDropzone({
  accept,
  title,
  subtitle,
  multiple,
  onFiles,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files ?? []);
      if (files.length > 0) onFiles(multiple ? files : files.slice(0, 1));
      setDragging(false);
    },
    [multiple, onFiles],
  );

  const onSelect = useCallback(() => {
    const files = Array.from(inputRef.current?.files ?? []);
    if (files.length > 0) onFiles(multiple ? files : files.slice(0, 1));
    setDragging(false);
  }, [multiple, onFiles]);

  return (
    <div>
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`flex min-h-[260px] w-full cursor-pointer items-center justify-center rounded-xl border border-dashed p-6 text-center transition ${
          dragging
            ? "border-cyan-300 bg-cyan-300/10"
            : "border-slate-700 bg-slate-950/40 hover:border-cyan-300/60 hover:bg-slate-950/70"
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <div className="space-y-3">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-900 text-cyan-300 ring-1 ring-slate-800">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
              <path d="M5 15.5v2A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-2" />
            </svg>
          </div>
          <div className="text-base font-medium text-white">{title}</div>
          <div className="text-sm text-slate-400">{subtitle}</div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
            Click to browse
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={onSelect}
      />
    </div>
  );
}
