const VARIANTS = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-cyan-50 text-cyan-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  indigo: "bg-indigo-50 text-indigo-700",
  outline: "border border-[#cfe1e8] bg-white text-slate-700",
};

const SIZES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export default function Badge({
  variant = "neutral",
  size = "md",
  icon: Icon,
  className = "",
  children,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-bold ${
        VARIANTS[variant] || VARIANTS.neutral
      } ${SIZES[size] || SIZES.md} ${className}`}
    >
      {Icon && <Icon className="h-3 w-3" strokeWidth={2.5} />}
      {children}
    </span>
  );
}
