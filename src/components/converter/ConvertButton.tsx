"use client";

type Props = {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  label?: string;
};

export default function ConvertButton({
  disabled,
  loading,
  onClick,
  label,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
    >
      {loading ? "Preparing conversion..." : (label ?? "Convert")}
    </button>
  );
}
