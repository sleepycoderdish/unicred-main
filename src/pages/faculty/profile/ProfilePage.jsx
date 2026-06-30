// src/pages/faculty/profile/ProfilePage.jsx
// ─────────────────────────────────────────────────────────────
// "My Profile" for an invited faculty / HOD.
//
// Two states, decided by whether the profile is already set:
//
//   NOT SET YET  → show the editable form (department + designation dropdowns)
//                  and POST /api/faculties/profile on submit.
//
//   ALREADY SET  → FREEZE it. Show the current department + designation as
//                  read-only. A faculty may set this ONCE; after that only an
//                  admin can change it (promotion). This prevents a member from
//                  switching their department/designation again and again.
//
// NOTE: this is a frontend guard for good UX. The backend should enforce the
//       same rule (reject a second profile push from a non-admin). The user is
//       adding that backend check too.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { PageHeader }   from '@/components/ui/PageHeader'
import { Select }       from '@/components/ui/Select'
import { Button }       from '@/components/ui/Button'
import { CardLoader }   from '@/components/ui/Loader'
import { useDepartments } from '@/hooks/useDepartments'
import { useMyFaculty, usePushFacultyProfile } from '@/hooks/useFaculties'

// Common academic designations shown in the dropdown.
const DESIGNATIONS = [
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Lecturer',
  'Senior Lecturer',
  'Visiting Faculty',
  'Lab Instructor',
  'Teaching Assistant',
].map(d => ({ value: d, label: d }))

// Small read-only "field" used in the frozen view.
function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{
        padding: '10px 12px', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-default)', background: 'var(--bg-input)',
        color: 'var(--text-primary)', fontSize: '0.9rem',
      }}>
        {value || '—'}
      </div>
    </div>
  )
}

export default function FacultyProfilePage() {
  const [form, setForm]   = useState({ departmentId: '', designation: '' })
  const [errors, setErrors] = useState({})

  // The current user's existing faculty record.
  const { data: myFaculty, isLoading: meLoading } = useMyFaculty()

  // All departments for the dropdown (listed by name).
  const { data: departments = [], isLoading: deptLoading, isError: deptError } = useDepartments()

  const { mutate: saveProfile, isPending } = usePushFacultyProfile()

  // Profile is "complete" (and therefore locked) once BOTH fields exist.
  const isLocked = !!(myFaculty?.departmentId && myFaculty?.designation)

  // Pre-fill the form (used only while the profile is still editable).
  useEffect(() => {
    if (myFaculty) {
      setForm({
        departmentId: myFaculty.departmentId ? String(myFaculty.departmentId) : '',
        designation:  myFaculty.designation ?? '',
      })
    }
  }, [myFaculty])

  const deptOptions = departments.map(d => ({ value: String(d.id), label: d.name }))

  // Department name to show in the frozen view. Prefer the embedded department
  // object; fall back to looking it up in the departments list by id.
  const lockedDeptName =
    myFaculty?.department?.name ||
    departments.find(d => Number(d.id) === Number(myFaculty?.departmentId))?.name ||
    `Department #${myFaculty?.departmentId ?? '—'}`

  function handleSubmit(e) {
    e.preventDefault()
    if (isLocked) return // safety: never submit when locked

    const errs = {}
    if (!form.departmentId) errs.departmentId = 'Select your department'
    if (!form.designation)  errs.designation  = 'Select your designation'
    setErrors(errs)
    if (Object.keys(errs).length) return

    saveProfile({ departmentId: Number(form.departmentId), designation: form.designation })
    // On success the hook refetches "my faculty", which flips isLocked to true,
    // so this page re-renders into the frozen read-only view automatically.
  }

  // While we don't yet know if the profile is set, show a loader (avoids a
  // flash of the editable form before flipping to the locked view).
  if (meLoading) {
    return (
      <div>
        <PageHeader title="My Profile" subtitle="Your department and designation" />
        <div style={{ maxWidth: 520 }}><CardLoader lines={3} /></div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle={isLocked
          ? 'Your department and designation'
          : 'Choose your department and designation to finish setting up your account.'}
      />

      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520,
      }}>
        {isLocked ? (
          // ── FROZEN VIEW ───────────────────────────────────────
          <>
            <ReadOnlyField label="Department"  value={lockedDeptName} />
            <ReadOnlyField label="Designation" value={myFaculty.designation} />
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px',
              fontSize: '0.8rem', color: 'var(--text-muted)',
            }}>
              Your profile is set and can no longer be changed here. Only an
              administrator can update your department or designation (e.g. a promotion).
            </div>
          </>
        ) : (
          // ── EDITABLE FORM (one-time) ──────────────────────────
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {deptLoading ? (
              <CardLoader lines={1} />
            ) : deptError ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--danger)' }}>
                Could not load departments. Please refresh, or ask your admin.
              </div>
            ) : (
              <Select
                label="Department"
                value={form.departmentId}
                onChange={e => { setForm(p => ({ ...p, departmentId: e.target.value })); setErrors(p => ({ ...p, departmentId: '' })) }}
                options={deptOptions}
                placeholder={deptOptions.length ? 'Select your department' : 'No departments found'}
                error={errors.departmentId}
                required
              />
            )}

            <Select
              label="Designation"
              value={form.designation}
              onChange={e => { setForm(p => ({ ...p, designation: e.target.value })); setErrors(p => ({ ...p, designation: '' })) }}
              options={DESIGNATIONS}
              placeholder="Select your designation"
              error={errors.designation}
              required
            />

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              You can set this only once. After saving, only an admin can change it.
            </div>

            <Button type="submit" variant="primary" loading={isPending} loadingText="Saving..."
              style={{ alignSelf: 'flex-start' }}>
              Save profile
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}