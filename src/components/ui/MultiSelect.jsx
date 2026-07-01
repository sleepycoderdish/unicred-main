// src/components/ui/MultiSelect.jsx
// ─────────────────────────────────────────────────────────────
// A real multi-select the achievement/internship forms can use for the
// faculty-reviewer picker. The native <select multiple> is clumsy on the
// web, so this renders each option as a toggleable "chip": click to add,
// click again to remove. Selected chips are highlighted.
//
// Value contract (matches how the pages already call it):
//   value    : array of selected option values   e.g. [12, 15]
//   onChange : called with the NEW array          onChange([12, 15, 18])
//
//   <MultiSelect
//     label="Reviewers"
//     options={[{ value, label }]}
//     value={form.facultyIds}
//     onChange={(vals) => setField("facultyIds", vals)}
//     error={errors.facultyIds}
//   />
// ─────────────────────────────────────────────────────────────

export function MultiSelect({
  label,
  required,
  error,
  hint,
  options = [],
  value = [],
  onChange,
  disabled,
  emptyText = "No options available.",
  style = {},
  id,
}) {
  const groupId  = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const hasError = !!error;

  // Toggle one value in/out of the selected array and hand the caller a
  // brand-new array (never mutate the prop in place).
  function toggle(optValue) {
    if (disabled) return;
    const isSelected = value.includes(optValue);
    const next = isSelected
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange?.(next);
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", ...style }}
      role="group"
      aria-labelledby={groupId}
    >
      {/* Label */}
      {label && (
        <span
          id={groupId}
          style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" }}
        >
          {label}
          {required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}
        </span>
      )}

      {/* Chip container — styled like the other inputs' border box */}
      <div
        style={{
          display:      "flex",
          flexWrap:     "wrap",
          gap:           8,
          padding:      "8px",
          minHeight:     44,
          alignItems:   "center",
          background:   "var(--bg-input)",
          border:       `1px solid ${hasError ? "var(--danger)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-sm)",
          boxShadow:     hasError ? "0 0 0 3px var(--danger-light)" : "none",
          opacity:       disabled ? 0.6 : 1,
        }}
      >
        {options.length === 0 && (
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{emptyText}</span>
        )}

        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"           // never submit the surrounding form
              onClick={() => toggle(opt.value)}
              disabled={disabled}
              aria-pressed={selected}
              style={{
                display:      "inline-flex",
                alignItems:   "center",
                gap:           6,
                fontSize:     "0.8rem",
                fontWeight:    500,
                padding:      "5px 10px",
                borderRadius: "999px",
                cursor:        disabled ? "not-allowed" : "pointer",
                transition:   "background 0.15s, color 0.15s, border-color 0.15s",
                color:         selected ? "var(--text-accent)" : "var(--text-secondary)",
                background:    selected ? "var(--accent-light)" : "var(--bg-elevated)",
                border:       `1px solid ${selected ? "var(--accent-border)" : "var(--border-default)"}`,
              }}
            >
              {/* check / plus marker */}
              <span aria-hidden="true" style={{ fontWeight: 700 }}>{selected ? "✓" : "+"}</span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Error takes priority over hint, mirroring Input/Select */}
      {(error || hint) && (
        <p style={{ fontSize: "0.75rem", color: hasError ? "var(--danger)" : "var(--text-muted)", margin: 0 }}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

export default MultiSelect;
