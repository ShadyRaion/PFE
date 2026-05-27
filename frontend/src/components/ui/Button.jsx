import { forwardRef } from "react";

const VARIANTS = {
  primary:
    "bg-cyan-700 text-white hover:bg-cyan-800 focus-visible:ring-cyan-700/40 disabled:bg-slate-300 disabled:text-white",
  secondary:
    "border border-[#cfe1e8] bg-white text-[#062633] hover:bg-cyan-50 focus-visible:ring-cyan-700/30 disabled:opacity-60",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40 disabled:bg-slate-300",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300 disabled:opacity-60",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500/40 disabled:bg-slate-300",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    icon: Icon,
    iconLeft: IconLeft,
    iconRight: IconRight,
    fullWidth = false,
    className = "",
    children,
    type = "button",
    ...rest
  },
  ref
) {
  const variantClasses = VARIANTS[variant] || VARIANTS.primary;
  const sizeClasses = SIZES[size] || SIZES.md;
  const widthClasses = fullWidth ? "w-full" : "";
  const LeadingIcon = IconLeft || Icon;

  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`}
      {...rest}
    >
      {LeadingIcon && <LeadingIcon className="h-4 w-4" strokeWidth={2.5} />}
      {children}
      {IconRight && <IconRight className="h-4 w-4" strokeWidth={2.5} />}
    </button>
  );
});

export default Button;
