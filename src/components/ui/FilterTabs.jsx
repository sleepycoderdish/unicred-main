// src/components/ui/FilterTabs.jsx
// ─────────────────────────────────────────────────────────────
// A small segmented filter used above lists/tables (status filters,
// review-queue tabs, ...). Built on the shared Button so it matches the
// rest of the app's dark theme instead of raw Tailwind chips.
//
//   <FilterTabs
//     tabs={[{ value: 'pending', label: 'Pending' }, ...]}
//     value={status}
//     onChange={setStatus}
//   />
// ─────────────────────────────────────────────────────────────

import { Button } from '@/components/ui/Button'

export function FilterTabs({ tabs = [], value, onChange, style = {} }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', ...style }}>
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          size="sm"
          variant={value === tab.value ? 'primary' : 'secondary'}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}

export default FilterTabs
