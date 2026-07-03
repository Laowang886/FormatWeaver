"use client";

import { useCallback, useRef } from "react";

type Props = {
  accept: string;
  onFile: (file: File) => void;
};

export default function FileDropzone({ accept, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  const onSelect = useCallback(() => {
    const file = inputRef.current?.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex min-h-[160px] w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 p-6 text-center"
        onClick={() => inputRef.current?.click()}
      >
        <div className="space-y-2">
          <div className="text-sm text-slate-300">Drag & drop file here</div>
          <div className="text-xs text-slate-400">Or click to select</div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onSelect}
      />
    </div>
  );
}
