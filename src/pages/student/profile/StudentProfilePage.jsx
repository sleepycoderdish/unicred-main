// src/pages/student/profile/StudentProfilePage.jsx
// ─────────────────────────────────────────────────────────────
// Student completes their profile ONCE.
//
// Backend:
//   GET  /api/students/profile/me   → returns the profile, or null if not made
//   POST /api/students/profile      → creates it (one time only)
//
// Behaviour:
//   - While loading        → show CardLoader
//   - profile === null     → show the editable creation form
//   - profile exists       → show the LOCKED read-only details (no editing)
//
// Once submitted, the student can only view — never change — their details.
// ─────────────────────────────────────────────────────────────

import { useState }      from 'react'
import { PageHeader }    from '@/components/ui/PageHeader'
import { Button }        from '@/components/ui/Button'
import { CardLoader }    from '@/components/ui/Loader'
import {
  useMyStudentProfile,
  useDepartments,
  useCreateStudentProfile,
} from '@/hooks/useStudentProfile'

// Current year, used to sanity-check batch / graduation years in the form
const THIS_YEAR = new Date().getFullYear()

export default function StudentProfilePage() {
  // 1. Does this student already have a profile?
  //    data === null  → not created yet → show form
  //    data === {...} → created         → show locked view
  const { data: profile, isLoading } = useMyStudentProfile()

  // ── Loading state ───────────────────────────────────────────
  if (isLoading) {
    return (
      <div>
        <PageHeader title="My Profile" subtitle="Your student details" />
        <CardLoader lines={6} />
      </div>
    )
  }

  // ── Profile already exists → locked read-only view ──────────
  if (profile) {
    return <ProfileView profile={profile} />
  }

  // ── No profile yet → show the one-time creation form ────────
  return <ProfileForm />
}

// =============================================================================
// LOCKED READ-ONLY VIEW  (shown after the profile has been submitted)
// =============================================================================
//
// Just displays the saved details. There is no edit button on purpose —
// the profile is frozen once created.
function ProfileView({ profile }) {
  // The fields we want to display, in order, with friendly labels.
  const rows = [
    { label: 'Roll Number',      value: profile.rollNo },
    { label: 'Department',       value: profile.department?.name },
    { label: 'Branch',           value: profile.branch },
    { label: 'Batch Year',       value: profile.batchYear },
    { label: 'Graduation Year',  value: profile.graduationYear },
    { label: 'Current Semester', value: `Semester ${profile.currentSemester}` },
  ]

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Your details have been submitted and are now locked"
      />

      {/* Locked notice banner */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:           10,
        padding:      '12px 16px',
        marginBottom:  20,
        background:   'rgba(99,102,241,0.08)',
        border:       '1px solid rgba(99,102,241,0.25)',
        borderRadius: 'var(--radius-md)',
        fontSize:     '0.82rem',
        color:        'var(--text-secondary)',
      }}>
        <span style={{ fontSize: 16 }}>🔒</span>
        Profile is locked. Contact your HOD if any detail needs correcting.
      </div>

      {/* Details card */}
      <div style={{
        background:    'rgba(22,27,39,0.8)',
        backdropFilter:'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border:       '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--radius-lg)',
        padding:      '24px',
      }}>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap:                  20,
        }}>
          {rows.map(({ label, value }) => (
            <div key={label}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                {label}
              </p>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600,
                color: 'var(--text-primary)' }}>
                {value ?? '—'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// CREATION FORM  (shown only when the student has no profile yet)
// =============================================================================
function ProfileForm() {
  // Load departments for the dropdown
  const { data: departments = [], isLoading: deptLoading } = useDepartments()

  // The mutation that POSTs the new profile
  const { mutate: createProfile, isPending } = useCreateStudentProfile()

  // ── Form state ──────────────────────────────────────────────
  // All inputs are text in the DOM, so numeric fields are kept as strings here
  // and converted to numbers right before sending.
  const [form, setForm] = useState({
    departmentId:    '',
    rollNo:          '',
    branch:          '',
    batchYear:       '',
    graduationYear:  '',
    currentSemester: '',
  })

  // Per-field error messages, shown under each input
  const [errors, setErrors] = useState({})

  // Generic change handler — updates one field by name
  function handleChange(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear that field's error as soon as the user edits it
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  // ── Frontend validation (mirrors backend rules) ─────────────
  // Returns an errors object; empty object means "all good".
  function validate() {
    const e = {}

    if (!form.departmentId)       e.departmentId = 'Please select a department.'
    if (!form.rollNo.trim())      e.rollNo       = 'Roll number is required.'
    if (!form.branch.trim())      e.branch       = 'Branch is required.'

    // batchYear — must be a 4-digit-ish year, not in the far future
    const batch = Number(form.batchYear)
    if (!form.batchYear)                       e.batchYear = 'Batch year is required.'
    else if (!Number.isInteger(batch) || batch < 1990 || batch > THIS_YEAR)
      e.batchYear = `Enter a valid year (1990–${THIS_YEAR}).`

    // graduationYear — must be a year, and after the batch year
    const grad = Number(form.graduationYear)
    if (!form.graduationYear)                  e.graduationYear = 'Graduation year is required.'
    else if (!Number.isInteger(grad) || grad < batch)
      e.graduationYear = 'Graduation year must be after batch year.'

    // currentSemester — 1 to 8
    const sem = Number(form.currentSemester)
    if (!form.currentSemester)                 e.currentSemester = 'Current semester is required.'
    else if (!Number.isInteger(sem) || sem < 1 || sem > 8)
      e.currentSemester = 'Semester must be between 1 and 8.'

    return e
  }

  // ── Submit handler ──────────────────────────────────────────
  function handleSubmit(ev) {
    ev.preventDefault()

    const found = validate()
    setErrors(found)

    // Stop if any validation error exists
    if (Object.keys(found).length > 0) return

    // Convert numeric fields with Number() before sending.
    // (Contract: string IDs/numbers can cause a 500 — always send integers.)
    createProfile({
      departmentId:    Number(form.departmentId),
      rollNo:          form.rollNo.trim(),
      branch:          form.branch.trim(),
      batchYear:       Number(form.batchYear),
      graduationYear:  Number(form.graduationYear),
      currentSemester: Number(form.currentSemester),
    })
    // On success the hook invalidates the profile query, so this page
    // automatically re-renders into the locked read-only view.
  }

  return (
    <div>
      <PageHeader
        title="Complete Your Profile"
        subtitle="Fill this once to register your student record. It cannot be edited later."
      />

      {/* One-time warning banner */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:           10,
        padding:      '12px 16px',
        marginBottom:  20,
        background:   'rgba(251,191,36,0.08)',
        border:       '1px solid rgba(251,191,36,0.25)',
        borderRadius: 'var(--radius-md)',
        fontSize:     '0.82rem',
        color:        'var(--text-secondary)',
      }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        Double-check everything — once submitted these details are locked.
      </div>

      {/* Form card */}
      <div style={{
        background:    'var(--bg-surface)',
        border:       '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding:      '24px',
        maxWidth:      640,
      }}>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap:                  18,
          }}>
            {/* Department dropdown */}
            <Field label="Department" error={errors.departmentId}>
              <select
                value={form.departmentId}
                onChange={e => handleChange('departmentId', e.target.value)}
                disabled={deptLoading}
                style={selectStyle}
              >
                <option value="">
                  {deptLoading ? 'Loading…' : 'Select department'}
                </option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </Field>

            {/* Roll number */}
            <Field label="Roll Number" error={errors.rollNo}>
              <input
                type="text"
                value={form.rollNo}
                onChange={e => handleChange('rollNo', e.target.value)}
                placeholder="e.g. 2024CSE101"
                style={inputStyle}
              />
            </Field>

            {/* Branch */}
            <Field label="Branch" error={errors.branch}>
              <input
                type="text"
                value={form.branch}
                onChange={e => handleChange('branch', e.target.value)}
                placeholder="e.g. CSE"
                style={inputStyle}
              />
            </Field>

            {/* Batch year */}
            <Field label="Batch Year" error={errors.batchYear}>
              <input
                type="number"
                value={form.batchYear}
                onChange={e => handleChange('batchYear', e.target.value)}
                placeholder="e.g. 2024"
                style={inputStyle}
              />
            </Field>

            {/* Graduation year */}
            <Field label="Graduation Year" error={errors.graduationYear}>
              <input
                type="number"
                value={form.graduationYear}
                onChange={e => handleChange('graduationYear', e.target.value)}
                placeholder="e.g. 2028"
                style={inputStyle}
              />
            </Field>

            {/* Current semester */}
            <Field label="Current Semester" error={errors.currentSemester}>
              <input
                type="number"
                value={form.currentSemester}
                onChange={e => handleChange('currentSemester', e.target.value)}
                placeholder="1 – 8"
                style={inputStyle}
              />
            </Field>
          </div>

          {/* Submit */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="primary"
              loading={isPending}
              loadingText="Submitting…"
            >
              Submit profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// =============================================================================
// SMALL HELPERS
// =============================================================================

// Field — wraps a label + input + optional error message.
// Keeps the form markup above clean and consistent.
function Field({ label, error, children }) {
  return (
    <div>
      <label style={{
        fontSize:     '0.8rem',
        fontWeight:    500,
        color:        'var(--text-secondary)',
        display:      'block',
        marginBottom:  6,
      }}>
        {label} <span style={{ color: 'var(--danger)' }}>*</span>
      </label>
      {children}
      {/* Error text only renders when this field has an error */}
      {error && (
        <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

// Shared input styling (matches the textarea style in ResultsPage.jsx)
const inputStyle = {
  width:        '100%',
  background:   'var(--bg-input)',
  border:       '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  color:        'var(--text-primary)',
  fontSize:     '0.875rem',
  padding:      '10px 12px',
  outline:      'none',
  fontFamily:   'var(--font-sans)',
}

// Dropdown uses the same look as the text inputs
const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
}