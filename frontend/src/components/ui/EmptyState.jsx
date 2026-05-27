export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfe1e8] bg-white p-10 text-center ${className}`}
    >
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
          <Icon className="h-7 w-7" strokeWidth={2} />
        </span>
      )}
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
