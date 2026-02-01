type StatusBannerProps = {
  status: "OPEN" | "FINALIZED";
};

export function StatusBanner({ status }: StatusBannerProps) {
  const styles =
    status === "OPEN"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <div className={`rounded-lg border px-4 py-2 text-sm font-medium ${styles}`}>
      Session status: {status === "OPEN" ? "Open" : "Finalized"}
    </div>
  );
}
