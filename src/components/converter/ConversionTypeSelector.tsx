"use client";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function ConversionTypeSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onChange("pdf-to-docx")}
        className={`rounded-xl p-4 text-left ring-1 ${value === "pdf-to-docx" ? "ring-sky-500 bg-sky-500/10" : "ring-white/5 bg-slate-900/60"}`}
      >
        <div className="font-medium text-white">PDF → DOCX</div>
        <div className="text-sm text-slate-400">
          Convert PDF files to editable DOCX
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange("docx-to-pdf")}
        className={`rounded-xl p-4 text-left ring-1 ${value === "docx-to-pdf" ? "ring-sky-500 bg-sky-500/10" : "ring-white/5 bg-slate-900/60"}`}
      >
        <div className="font-medium text-white">DOCX → PDF</div>
        <div className="text-sm text-slate-400">
          Convert Word documents to PDF
        </div>
      </button>
    </div>
  );
}
