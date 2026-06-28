// src/pages/admin/grading/GradingSystemPage.jsx
// Admin page: Create and manage grading systems.
//
// The rule table builder validates:
//   - Rules sorted by minMarksPercent
//   - First rule starts at 0, last ends at 100
//   - No gaps (row[n].max + 0.01 ≈ row[n+1].min)
//   - No overlaps
//   - Exactly one F rule (gradePoint = 0)
// These match backend rules exactly to prevent 400 errors.

import { useState } from 'react'
import { PageHeader }           from '@/components/ui/PageHeader'
import { Button }               from '@/components/ui/Button'
import { Input }                from '@/components/ui/Input'
import { Modal }                from '@/components/ui/Modal'
import { CardLoader }           from '@/components/ui/Loader'
import { useGradingSystems, useCreateGradingSystem, useActivateGradingSystem } from '@/hooks/useGradingSystems'

// Blank rule template
const BLANK_RULE = { grade: '', gradePoint: '', minMarksPercent: '', maxMarksPercent: '' }

// ── Validate rule table ───────────────────────────────────────
// Returns error string or '' if valid
function validateRules(rules) {
  if (rules.length < 2) return 'Add at least 2 rules.'
  const sorted = [...rules].sort((a, b) => Number(a.minMarksPercent) - Number(b.minMarksPercent))
  const fRules = sorted.filter(r => Number(r.gradePoint) === 0)
  if (fRules.length !== 1) return 'Exactly one rule must have grade point = 0 (the fail rule).'
  if (Number(sorted[0].minMarksPercent) !== 0) return 'First rule must start at 0%.'
  if (Number(sorted[sorted.length - 1].maxMarksPercent) !== 100) return 'Last rule must end at 100%.'
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = Number(sorted[i].maxMarksPercent)
    const next = Number(sorted[i + 1].minMarksPercent)
    // Allow ≤ 0.01 difference for boundaries like 79.99 → 80
    if (Math.abs(curr + 0.01 - next) > 0.02)
      return `Gap or overlap between ${sorted[i].grade} and ${sorted[i + 1].grade}.`
  }
  return ''
}

// ── Create System Modal ───────────────────────────────────────
function CreateSystemModal({ isOpen, onClose }) {
  const [name, setName]   = useState('')
  const [rules, setRules] = useState([
    { grade: 'O',  gradePoint: '10', minMarksPercent: '90',   maxMarksPercent: '100' },
    { grade: 'A+', gradePoint: '9',  minMarksPercent: '80',   maxMarksPercent: '89.99' },
    { grade: 'A',  gradePoint: '8',  minMarksPercent: '70',   maxMarksPercent: '79.99' },
    { grade: 'B+', gradePoint: '7',  minMarksPercent: '60',   maxMarksPercent: '69.99' },
    { grade: 'B',  gradePoint: '6',  minMarksPercent: '50',   maxMarksPercent: '59.99' },
    { grade: 'F',  gradePoint: '0',  minMarksPercent: '0',    maxMarksPercent: '49.99' },
  ])
  const [ruleError, setRuleError] = useState('')
  const { mutate: create, isPending } = useCreateGradingSystem()

  function updateRule(idx, field, value) {
    setRules(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
    setRuleError('')
  }

  function addRule() {
    setRules(prev => [...prev, { ...BLANK_RULE }])
  }

  function removeRule(idx) {
    setRules(prev => prev.filter((_, i) => i !== idx))
    setRuleError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const err = validateRules(rules)
    if (err) { setRuleError(err); return }

    // Sort by minMarksPercent before sending
    const sorted = [...rules]
      .sort((a, b) => Number(a.minMarksPercent) - Number(b.minMarksPercent))
      .map(r => ({
        grade:           r.grade.trim(),
        gradePoint:      Number(r.gradePoint),
        minMarksPercent: Number(r.minMarksPercent),
        maxMarksPercent: Number(r.maxMarksPercent),
      }))

    create({ name: name.trim(), rules: sorted }, {
      onSuccess: () => { setName(''); setRules([]); setRuleError(''); onClose() },
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Grading System" maxWidth={680}>
      <form onSubmit={handleSubmit} noValidate>
        <Input label="System name" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. NITKKR 10-Point Scale" required style={{ marginBottom: 20 }} />

        {/* Rule table */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 90px 90px 90px 40px',
            gap: 8, padding: '8px 10px', background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-sm)', marginBottom: 6 }}>
            {['Grade', 'Points', 'Min %', 'Max %', ''].map(h => (
              <span key={h} style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
            {rules.map((rule, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 90px 90px 90px 40px', gap: 8, alignItems: 'center' }}>
                {['grade', 'gradePoint', 'minMarksPercent', 'maxMarksPercent'].map(field => (
                  <input key={field} value={rule[field]}
                    onChange={e => updateRule(idx, field, e.target.value)}
                    placeholder={field === 'grade' ? 'A+' : '0'}
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                      fontSize: '0.85rem', padding: '6px 10px', outline: 'none', width: '100%' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                  />
                ))}
                <button type="button" onClick={() => removeRule(idx)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)',
                    cursor: 'pointer', fontSize: 16, padding: '4px', display: 'flex', alignItems: 'center' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={addRule}
            style={{ marginTop: 10, background: 'none', border: '1px dashed var(--border-default)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer',
              padding: '7px 16px', width: '100%', fontSize: '0.85rem',
              transition: 'border-color 0.15s, color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
            + Add rule
          </button>

          {ruleError && (
            <p style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: 8 }}>{ruleError}</p>
          )}
        </div>

        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending} loadingText="Creating...">Create system</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function GradingSystemPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: systems = [], isLoading } = useGradingSystems()
  const { mutate: activate, isPending: activating } = useActivateGradingSystem()

  return (
    <div>
      <PageHeader title="Grading Systems"
        subtitle="Configure the grading scale used to compute grades and CGPA"
        action={<Button variant="primary" onClick={() => setCreateOpen(true)}>+ New System</Button>}
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2].map(i => <CardLoader key={i} lines={3} />)}
        </div>
      ) : systems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No custom grading system yet. The built-in 10-point scale is active.</p>
          <Button variant="accent" size="sm" onClick={() => setCreateOpen(true)}>Create custom system</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {systems.map(sys => (
            <div key={sys.id} style={{ background: 'var(--bg-surface)', border: `1px solid ${sys.isActive && !sys.isDefault ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sys.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {sys.rules?.length ?? 0} rules
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {sys.isDefault ? (
                    // Global default — cannot be activated or deactivated
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                      borderRadius: 99, padding: '3px 12px' }}>Default</span>
                  ) : sys.isActive ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)',
                      background: 'var(--accent-light)', border: '1px solid var(--accent-border)',
                      borderRadius: 99, padding: '3px 12px' }}>Active</span>
                  ) : (
                    <Button variant="ghost" size="sm" loading={activating}
                      onClick={() => activate(sys.id)}>Activate</Button>
                  )}
                </div>
              </div>

              {/* Rules summary */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(sys.rules ?? []).sort((a,b) => b.minMarksPercent - a.minMarksPercent).map(rule => (
                  <div key={rule.grade} style={{ background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                    padding: '4px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: rule.gradePoint === 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                      {rule.grade}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {rule.minMarksPercent}–{rule.maxMarksPercent}% · {rule.gradePoint} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateSystemModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
