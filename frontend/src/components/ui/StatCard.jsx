export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  trendDirection = "neutral",
  accent = "cyan",
  className = "",
}) {
  const accents = {
    cyan: "bg-cyan-50 text-cyan-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    indigo: "bg-indigo-50 text-indigo-700",
    slate: "bg-slate-100 text-slate-700",
  };

  const trendColors = {
    up: "text-emerald-600",
    down: "text-rose-600",
    neutral: "text-slate-500",
  };

  return (
    <div
      className={`rounded-2xl border border-[#cfe1e8] bg-white p-5 shadow-card transition hover:shadow-card-hover ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          {hint && (
            <p className="mt-1 truncate text-sm text-slate-600">{hint}</p>
          )}
          {trend && (
            <p
              className={`mt-2 text-xs font-bold ${
                trendColors[trendDirection] || trendColors.neutral
              }`}
            >
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              accents[accent] || accents.cyan
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={2.5} />
          </span>
        )}
      </div>
    </div>
  );
}
