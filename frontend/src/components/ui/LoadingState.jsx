import { Loader2 } from "lucide-react";

export default function LoadingState({
  message,
  label,
  className = "",
  fullPage = false,
}) {
  const displayMessage = message || label || "Loading...";

  const wrapper = fullPage
    ? "flex min-h-[60vh] w-full items-center justify-center"
    : "flex w-full items-center justify-center py-12";

  return (
    <div className={`${wrapper} ${className}`}>
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-700" strokeWidth={2.5} />
        <p className="text-sm font-semibold">{displayMessage}</p>
      </div>
    </div>
  );
}
