import { forwardRef } from "react";

export const Field = ({ label, htmlFor, hint, error, required, className = "", children }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-bold text-slate-700"
        >
          {label}
          {required && <span className="ml-0.5 text-rose-600">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-semibold text-rose-600">{error}</p>
      )}
    </div>
  );
};

export const Input = forwardRef(function Input(
  { className = "", error = false, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
        error
          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
          : "border-[#cfe1e8] focus:border-cyan-700 focus:ring-cyan-200"
      } ${className}`}
      {...rest}
    />
  );
});

export const Textarea = forwardRef(function Textarea(
  { className = "", error = false, rows = 4, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 disabled:bg-slate-50 ${
        error
          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
          : "border-[#cfe1e8] focus:border-cyan-700 focus:ring-cyan-200"
      } ${className}`}
      {...rest}
    />
  );
});

export const Select = forwardRef(function Select(
  { className = "", error = false, children, ...rest },
  ref
) {
  return (
    <select
      ref={ref}
      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 disabled:bg-slate-50 ${
        error
          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
          : "border-[#cfe1e8] focus:border-cyan-700 focus:ring-cyan-200"
      } ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
});

export default Field;
