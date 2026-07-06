"use client";

import { useState } from "react";
import type { ConversionType } from "@/components/converter/conversion-types";

type ConversionOption = {
  label: string;
  conversionType: ConversionType;
};

type ConversionRoute = {
  label: string;
  options: readonly ConversionOption[];
};

export const CONVERSION_ROUTES = [
  {
    label: "Doc Convert",
    options: [
      { label: "PDF to Word", conversionType: "pdf-word" },
      { label: "Word to PDF", conversionType: "word-pdf" },
    ],
  },
  {
    label: "Image Convert",
    options: [
      { label: "Compress Image", conversionType: "image-compress" },
      { label: "Convert Image Format", conversionType: "image-format" },
    ],
  },
  {
    label: "PDF Merge",
    options: [
      { label: "Merge PDF", conversionType: "pdf-merge" },
      { label: "Split PDF", conversionType: "pdf-split" },
    ],
  },
  {
    label: "PDF Image",
    options: [
      { label: "PDF to Images", conversionType: "pdf-image" },
      { label: "Images to PDF", conversionType: "images-pdf" },
    ],
  },
] as const satisfies readonly ConversionRoute[];

type Props = {
  value: ConversionType;
  onChange: (value: ConversionType) => void;
};

type OpenMenu = "category" | "option" | null;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m7 10 5 5 5-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function ConversionTypeSelector({ value, onChange }: Props) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const currentRoute =
    CONVERSION_ROUTES.find((route) =>
      route.options.some((option) => option.conversionType === value),
    ) ?? CONVERSION_ROUTES[0];
  const currentOption =
    currentRoute.options.find((option) => option.conversionType === value) ??
    currentRoute.options[0];

  const selectCategory = (route: (typeof CONVERSION_ROUTES)[number]) => {
    if (route.label !== currentRoute.label) {
      onChange(route.options[0].conversionType);
    }
    setOpenMenu(null);
  };

  const selectOption = (option: ConversionOption) => {
    onChange(option.conversionType);
    setOpenMenu(null);
  };

  return (
    <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 sm:w-60">
        <span className="sr-only" id="conversion-category-label">
          Select category
        </span>
        <button
          type="button"
          aria-expanded={openMenu === "category"}
          aria-haspopup="listbox"
          aria-labelledby="conversion-category-label conversion-category-value"
          className="flex min-h-12 w-full items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-950/75 px-4 text-left text-sm font-semibold text-white shadow-sm transition hover:border-slate-500 hover:bg-slate-950 focus-visible:border-cyan-300/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/25"
          onClick={() =>
            setOpenMenu((current) =>
              current === "category" ? null : "category",
            )
          }
        >
          <span id="conversion-category-value">{currentRoute.label}</span>
          <Chevron open={openMenu === "category"} />
        </button>

        {openMenu === "category" && (
          <div
            aria-labelledby="conversion-category-label"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-xl border border-slate-700 bg-[#0b1220] p-1.5 shadow-2xl shadow-black/45"
            role="listbox"
          >
            {CONVERSION_ROUTES.map((route) => {
              const isSelected = route.label === currentRoute.label;

              return (
                <button
                  key={route.label}
                  type="button"
                  aria-selected={isSelected}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50 ${
                    isSelected
                      ? "bg-cyan-300/10 font-semibold text-cyan-200"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                  onClick={() => selectCategory(route)}
                  role="option"
                >
                  {route.label}
                  {isSelected && (
                    <span aria-hidden="true" className="text-cyan-300">
                      •
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <span aria-hidden="true" className="hidden text-cyan-300 sm:block">
        →
      </span>

      <div className="relative min-w-0 sm:w-64">
        <span className="sr-only" id="conversion-option-label">
          Select conversion option
        </span>
        <button
          type="button"
          aria-expanded={openMenu === "option"}
          aria-haspopup="listbox"
          aria-labelledby="conversion-option-label conversion-option-value"
          className="flex min-h-12 w-full items-center justify-between gap-4 rounded-xl border border-cyan-400/35 bg-cyan-400/[0.06] px-4 text-left text-sm font-semibold text-cyan-50 shadow-sm transition hover:border-cyan-300/55 hover:bg-cyan-400/[0.09] focus-visible:border-cyan-300/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/25"
          onClick={() =>
            setOpenMenu((current) => (current === "option" ? null : "option"))
          }
        >
          <span id="conversion-option-value">{currentOption.label}</span>
          <Chevron open={openMenu === "option"} />
        </button>

        {openMenu === "option" && (
          <div
            aria-labelledby="conversion-option-label"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-xl border border-slate-700 bg-[#0b1220] p-1.5 shadow-2xl shadow-black/45"
            role="listbox"
          >
            {currentRoute.options.map((option) => {
              const isSelected =
                option.conversionType === currentOption.conversionType;

              return (
                <button
                  key={option.conversionType}
                  type="button"
                  aria-selected={isSelected}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50 ${
                    isSelected
                      ? "bg-cyan-300/10 font-semibold text-cyan-200"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                  onClick={() => selectOption(option)}
                  role="option"
                >
                  {option.label}
                  {isSelected && (
                    <span aria-hidden="true" className="text-cyan-300">
                      •
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
