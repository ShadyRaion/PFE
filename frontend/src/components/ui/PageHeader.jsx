export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  className = "",
}) {
  return (
    <section
      className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
              <Icon className="h-5 w-5" strokeWidth={2.5} />
            </span>
          )}
          <h1 className="truncate text-3xl font-black text-slate-950">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="mt-2 text-base text-slate-600">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </section>
  );
}
