"use client";

import {
  CONVERSION_TYPES,
  ConversionType,
} from "@/components/converter/conversion-types";

type Props = {
  value: ConversionType;
  onChange: (v: ConversionType) => void;
};

export default function ConversionTypeSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-2">
      {CONVERSION_TYPES.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`group border p-4 text-left transition ${
            value === item.id
              ? "border-cyan-300 bg-cyan-300/10"
              : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium text-white">{item.title}</div>
              <div className="mt-1 text-sm leading-5 text-slate-400">
                {item.description}
              </div>
            </div>
            <span
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                value === item.id ? "bg-cyan-300" : "bg-slate-700"
              }`}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
