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
        className={`flex min-h-[230px] w-full cursor-pointer items-center justify-center border-2 border-dashed p-6 text-center transition ${
          dragging
            ? "border-cyan-300 bg-cyan-300/10"
            : "border-slate-600 bg-[#0c111b] hover:border-cyan-300/70 hover:bg-[#111827]"
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <div className="space-y-3">
          <div className="mx-auto grid h-12 w-12 place-items-center border border-cyan-300/40 bg-cyan-300/10 text-cyan-200">
            UP
          </div>
          <div className="text-base font-medium text-white">{title}</div>
          <div className="text-sm text-slate-400">{subtitle}</div>
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">
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
