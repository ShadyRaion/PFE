import { Field, Input, Select } from "../ui";

function DateRangeFilter({
  id = "dateFilter",
  label = "Date",
  value,
  onChange,
  className = "",
}) {
  const range = value || { mode: "ALL", from: "", to: "" };
  const update = (patch) => onChange({ ...range, ...patch });

  return (
    <div className={`space-y-2 ${className}`}>
      <Field label={label} htmlFor={id}>
        <Select
          id={id}
          value={range.mode}
          onChange={(e) => update({ mode: e.target.value })}
        >
          <option value="ALL">All dates</option>
          <option value="TODAY">Today</option>
          <option value="7_DAYS">Last 7 days</option>
          <option value="30_DAYS">Last 30 days</option>
          <option value="CUSTOM">Custom period</option>
        </Select>
      </Field>

      {range.mode === "CUSTOM" && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Field htmlFor={`${id}From`}>
            <Input
              id={`${id}From`}
              type="date"
              value={range.from || ""}
              onChange={(e) => update({ from: e.target.value })}
              aria-label="From date"
            />
          </Field>
          <Field htmlFor={`${id}To`}>
            <Input
              id={`${id}To`}
              type="date"
              value={range.to || ""}
              onChange={(e) => update({ to: e.target.value })}
              aria-label="To date"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

export default DateRangeFilter;
