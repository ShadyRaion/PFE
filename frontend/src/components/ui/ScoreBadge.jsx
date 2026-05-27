import Badge from "./Badge";

export default function ScoreBadge({ score, size = "md", className = "" }) {
  const value = Number(score || 0);
  let variant = "danger";
  if (value >= 80) variant = "success";
  else if (value >= 60) variant = "warning";
  else if (value >= 40) variant = "warning";

  return (
    <Badge variant={variant} size={size} className={className}>
      {Math.round(value)}%
    </Badge>
  );
}
