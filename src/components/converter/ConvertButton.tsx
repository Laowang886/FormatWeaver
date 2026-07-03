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
      className="inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-3 font-medium text-white hover:bg-sky-400 disabled:opacity-60"
    >
      {loading ? "Converting..." : (label ?? "Convert")}
    </button>
  );
}
