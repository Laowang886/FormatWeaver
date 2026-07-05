"use client";

import {
  ConversionOptionField,
  ConversionOptionsState,
  MergeOrder,
  TargetImageFormat,
} from "@/components/converter/conversion-types";

type Props = {
  fields: ConversionOptionField[];
  values: ConversionOptionsState;
  onChange: (next: ConversionOptionsState) => void;
};

function updateValues<T extends keyof ConversionOptionsState>(
  values: ConversionOptionsState,
  key: T,
  value: ConversionOptionsState[T],
) {
  return {
    ...values,
    [key]: value,
  };
}

export default function ConversionOptions({ fields, values, onChange }: Props) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-5">
      <div className="text-sm font-medium text-white">Conversion options</div>

      <div className="space-y-4">
        {fields.map((field) => {
          if (field.kind === "pageRange") {
            return (
              <label key={field.key} className="block space-y-2">
                <div className="text-sm font-medium text-slate-100">
                  {field.label}
                </div>
                <input
                  value={values.pageRange}
                  onChange={(event) =>
                    onChange(
                      updateValues(values, "pageRange", event.target.value),
                    )
                  }
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15"
                />
                <p className="text-xs leading-5 text-slate-400">
                  {field.helperText}
                </p>
              </label>
            );
          }

          if (field.kind === "quality") {
            return (
              <div key={field.key} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-slate-100">
                    {field.label}
                  </div>
                  <div className="text-sm text-cyan-300">
                    {values.compressionQuality}%
                  </div>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={values.compressionQuality}
                  onChange={(event) =>
                    onChange(
                      updateValues(
                        values,
                        "compressionQuality",
                        Number(event.target.value),
                      ),
                    )
                  }
                  className="w-full"
                />
                <p className="text-xs leading-5 text-slate-400">
                  {field.helperText}
                </p>
              </div>
            );
          }

          if (field.kind === "select") {
            const selectValue =
              field.key === "targetFormat"
                ? values.targetFormat
                : values.mergeOrder;

            return (
              <label key={field.key} className="block space-y-2">
                <div className="text-sm font-medium text-slate-100">
                  {field.label}
                </div>
                <select
                  value={selectValue}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    if (field.key === "targetFormat") {
                      onChange(
                        updateValues(
                          values,
                          "targetFormat",
                          nextValue as TargetImageFormat,
                        ),
                      );
                      return;
                    }

                    onChange(
                      updateValues(
                        values,
                        "mergeOrder",
                        nextValue as MergeOrder,
                      ),
                    );
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15"
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-5 text-slate-400">
                  {field.helperText}
                </p>
              </label>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
