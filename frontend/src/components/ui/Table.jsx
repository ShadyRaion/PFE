export function Table({ className = "", children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#cfe1e8] bg-white shadow-card">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  );
}

export function THead({ className = "", children }) {
  return (
    <thead className={`bg-slate-50 ${className}`}>{children}</thead>
  );
}

export function TBody({ className = "", children }) {
  return (
    <tbody className={`divide-y divide-[#e7eef2] ${className}`}>
      {children}
    </tbody>
  );
}

export function Tr({ className = "", interactive = false, ...rest }) {
  return (
    <tr
      className={`${
        interactive ? "transition hover:bg-cyan-50/40" : ""
      } ${className}`}
      {...rest}
    />
  );
}

export function Th({ className = "", children, align = "left" }) {
  const alignClass =
    align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : "text-left";
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500 ${alignClass} ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ className = "", children, align = "left" }) {
  const alignClass =
    align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : "text-left";
  return (
    <td
      className={`px-4 py-3 align-middle text-sm text-slate-700 ${alignClass} ${className}`}
    >
      {children}
    </td>
  );
}

export default Table;
