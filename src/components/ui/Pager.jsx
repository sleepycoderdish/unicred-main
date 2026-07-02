// src/components/ui/Pager.jsx
// ─────────────────────────────────────────────────────────────
// Standard "Previous / Page X of Y / Next" pager for the paginated
// list and table pages. Styled with the shared Button so it matches
// the rest of the app.
//
//   <Pager
//     page={page}
//     totalPages={data.pagination.totalPages}
//     onPrev={() => setPage((p) => p - 1)}
//     onNext={() => setPage((p) => p + 1)}
//   />
// ─────────────────────────────────────────────────────────────

import { Button } from '@/components/ui/Button'

export function Pager({ page, totalPages, onPrev, onNext, style = {} }) {
  if (!totalPages) return null
  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginTop:       24,
        ...style,
      }}
    >
      <Button size="sm" variant="secondary" disabled={page <= 1} onClick={onPrev}>
        Previous
      </Button>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Page {page} of {totalPages}
      </span>
      <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={onNext}>
        Next
      </Button>
    </div>
  )
}

export default Pager
