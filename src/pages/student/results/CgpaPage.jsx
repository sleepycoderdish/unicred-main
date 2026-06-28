// src/pages/student/results/CgpaPage.jsx
// CGPA trend chart + semester-wise SGPA history.
// Uses recharts (already in package.json).
// CGPA/SGPA are always fetched from backend — never computed on frontend.

import { PageHeader }   from '@/components/ui/PageHeader'
import { CardLoader }   from '@/components/ui/Loader'
import { useCgpaHistory } from '@/hooks/useStudentResults'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

// Custom tooltip shown on chart hover
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.82rem' }}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--text-primary)' }}>Semester {label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ margin: '2px 0', color: p.color }}>
          {p.name}: {p.value?.toFixed(2)}
        </p>
      ))}
    </div>
  )
}

export default function CgpaPage() {
  const { data: history = [], isLoading } = useCgpaHistory()

  // Latest CGPA is the last entry
  const latest = history[history.length - 1]

  // Chart data shape recharts expects
  const chartData = history.map(h => ({
    sem:         h.semester?.semesterNumber,
    sgpa:        h.sgpa,
    cgpa:        h.cgpa,
    classAvg:    h.classAverageCgpa,
  }))

  return (
    <div>
      <PageHeader title="CGPA" subtitle="Semester-wise academic performance" />

      {isLoading ? (
        <CardLoader lines={5} />
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No CGPA data yet. Results must be published first.</p>
        </div>
      ) : (
        <>
          {/* Current CGPA KPI */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
            {[
              { label: 'Current CGPA',  value: latest?.cgpa?.toFixed(2),            color: 'var(--text-accent)' },
              { label: 'Latest SGPA',   value: latest?.sgpa?.toFixed(2),            color: 'var(--accent-sky)' },
              { label: 'Class Average', value: latest?.classAverageCgpa?.toFixed(2),color: 'var(--text-muted)' },
              { label: 'Total Credits', value: latest?.totalCredits,                 color: 'var(--success)' },
            ].map(k => (
              <div key={k.label} style={{ flex: 1, minWidth: 140,
                background: 'rgba(22,27,39,0.8)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-lg)',
                padding: '18px 22px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '0.72rem', color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</p>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: k.color,
                  fontFamily: 'var(--font-display)' }}>{k.value ?? '—'}</p>
              </div>
            ))}
          </div>

          {/* SGPA / CGPA line chart */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Performance Trend
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="sem" tickFormatter={v => `Sem ${v}`}
                  tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} ticks={[0,2,4,6,8,10]}
                  tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }} />
                {/* Class average reference */}
                {latest?.classAverageCgpa && (
                  <ReferenceLine y={latest.classAverageCgpa} stroke="#475569"
                    strokeDasharray="4 4" label={{ value: 'Class avg', fill: '#475569', fontSize: 11 }} />
                )}
                <Line type="monotone" dataKey="sgpa"     name="SGPA"     stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} />
                <Line type="monotone" dataKey="cgpa"     name="CGPA"     stroke="#38bdf8" strokeWidth={2} dot={{ r: 4, fill: '#38bdf8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Semester breakdown table */}
          <div style={{ marginTop: 20, background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
              gap: 16, padding: '10px 20px', background: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border-subtle)' }}>
              {['Semester', 'SGPA', 'CGPA', 'Credits', 'Class Avg'].map(h => (
                <span key={h} style={{ fontSize: '0.72rem', fontWeight: 600,
                  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>
            {history.map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                gap: 16, padding: '13px 20px', alignItems: 'center',
                borderBottom: i < history.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Sem {h.semester?.semesterNumber}</p>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--accent)' }}>{h.sgpa?.toFixed(2)}</p>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--accent-sky)' }}>{h.cgpa?.toFixed(2)}</p>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{h.totalCredits}</p>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>{h.classAverageCgpa?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
