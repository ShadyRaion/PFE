export function Card({ as: As = "div", className = "", children, ...rest }) {
  return (
    <As
      className={`rounded-2xl border border-[#cfe1e8] bg-white shadow-card ${className}`}
      {...rest}
    >
      {children}
    </As>
  );
}

export function CardHeader({ className = "", children, ...rest }) {
  return (
    <div
      className={`border-b border-[#cfe1e8] px-6 py-4 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = "", children, ...rest }) {
  return (
    <div className={`px-6 py-5 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...rest }) {
  return (
    <div
      className={`border-t border-[#cfe1e8] bg-slate-50/40 px-6 py-4 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
