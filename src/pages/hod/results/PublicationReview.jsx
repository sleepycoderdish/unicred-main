// src/pages/hod/results/PublicationReview.jsx
// HOD: Detailed review of one publication.
// Three tabs: Summary (all marks), Pending (chase-up), Failures (grade F).

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader }    from '@/components/ui/PageHeader'
import { Button }        from '@/components/ui/Button'
import { Badge }         from '@/components/ui/Badge'
import { CardLoader }    from '@/components/ui/Loader'
import { usePublicationById, usePublicationSummary, usePendingSubmissions, useFailedStudents } from '@/hooks/useResultPublications'

const TABS = ['Summary', 'Pending', 'Failures']

function GradeBadge({ grade, isPassed }) {
  if (!grade) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const color = grade === 'F' ? 'var(--danger)' : grade.startsWith('O') ? 'var(--success)' : 'var(--accent)'
  return (
    <span style={{ fontWeight: 700, fontSize: '0.82rem', color }}>{grade}</span>
  )
}

export default function PublicationReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Summary')

  const { data: pub,      isLoading: pubLoading }  = usePublicationById(Number(id))
  const { data: summary,  isLoading: sumLoading }  = usePublicationSummary(Number(id))
  const pubDeptId = pub?.departmentId ?? pub?.department?.id ?? null
  const { data: pending,  isLoading: pendLoading } = usePendingSubmissions(Number(id), pubDeptId)
  const { data: failures, isLoading: failLoading } = useFailedStudents(Number(id))

  if (pubLoading) return <div style={{ padding: 40 }}><CardLoader lines={4} /></div>

  return (
    <div>
      <PageHeader
        title={`Review — Semester ${pub?.semesterNumber} · Batch ${pub?.batchYear}`}
        breadcrumb="Result Publications"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/hod/results')}>
            ← Back
          </Button>
        }
      />

      {/* Publication meta */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <Badge type="status" value={pub?.status} />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {pub?.completionPercent ?? 0}% submitted
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '8px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 600,
              color: tab === t ? 'var(--text-accent)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s',
            }}>
            {t}
            {t === 'Pending'  && pending  ? ` (${pending.length})`  : ''}
            {t === 'Failures' && failures ? ` (${failures.length})` : ''}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

        {/* ── Summary tab ────────────────────────────────── */}
        {tab === 'Summary' && (
          sumLoading ? <div style={{ padding: 20 }}><CardLoader lines={4} /></div>
          : !summary || summary.length === 0
          ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No data yet.</p>
          : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 80px',
                gap: 16, padding: '10px 20px', background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border-subtle)' }}>
                {['Student', 'Subject', 'Faculty', 'Marks', 'Grade'].map(h => (
                  <span key={h} style={{ fontSize: '0.72rem', fontWeight: 600,
                    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                ))}
              </div>
              {summary.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 80px',
                  gap: 16, padding: '13px 20px', alignItems: 'center',
                  borderBottom: i < summary.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {row.student?.user?.name ?? '—'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {row.subject?.courseCode} · {row.subject?.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {row.faculty?.user?.name ?? '—'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {row.marks ?? '—'}
                  </p>
                  <GradeBadge grade={row.grade} />
                </div>
              ))}
            </>
          )
        )}

        {/* ── Pending tab ─────────────────────────────────── */}
        {tab === 'Pending' && (
          pendLoading ? <div style={{ padding: 20 }}><CardLoader lines={3} /></div>
          : pending?.length === 0
          ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--success)', fontWeight: 600 }}>
              All faculty have submitted ✓
            </p>
          : pending?.map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', borderBottom: i < pending.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {row.faculty?.user?.name}
                </p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {row.faculty?.user?.email}
                </p>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {row.subject?.courseCode} · {row.subject?.name}
              </span>
            </div>
          ))
        )}

        {/* ── Failures tab ─────────────────────────────────── */}
        {tab === 'Failures' && (
          failLoading ? <div style={{ padding: 20 }}><CardLoader lines={3} /></div>
          : failures?.length === 0
          ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--success)', fontWeight: 600 }}>
              No failures ✓
            </p>
          : failures?.map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', borderBottom: i < failures.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {row.student?.user?.name}
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{row.subject?.courseCode}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--danger)' }}>F</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
