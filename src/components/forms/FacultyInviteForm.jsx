// src/components/forms/FacultyInviteForm.jsx
// ─────────────────────────────────────────────────────────────
// Reusable invite form used on BOTH the Admin and HOD invite pages.
//
// What it does:
//   - Collects the invitee's name, email, and role.
//   - The ROLE choices are passed in by the parent:
//       Admin → can invite "faculty" or "hod"
//       HOD   → can invite only "faculty" (single fixed option)
//   - The invitee's email must belong to the same domain as the school
//     (e.g. "@nitkkr.ac.in"). The parent passes that domain in. If the domain
//     is known we enforce it on the client; if it's unknown (couldn't be
//     determined), we still send the request and let the backend reject a
//     wrong domain — and we show the backend's message.
//   - On success we show an inline success message AND a toast (the backend
//     emails the temporary password to the invitee).
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Input }  from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useInvite } from '@/hooks/useInvite'
import { validateEmail } from '@/utils/validators'

/**
 * FacultyInviteForm
 *
 * @param {Object}   props
 * @param {Array}    props.roleOptions - [{ value, label }]; if length 1 the role is fixed
 * @param {string|null} props.domain   - required email domain (e.g. "nitkkr.ac.in") or null if unknown
 */
export function FacultyInviteForm({ roleOptions = [], domain = null }) {
  // If only one role is allowed (HOD case), pre-select it and hide the dropdown.
  const onlyRole = roleOptions.length === 1 ? roleOptions[0].value : ''

  const [form, setForm]   = useState({ name: '', email: '', role: onlyRole })
  const [errors, setErrors] = useState({})
  const [sentTo, setSentTo] = useState('') // last email we successfully invited

  const { mutate: invite, isPending } = useInvite()

  // helper: domain part of an email, lowercased (e.g. "a@b.com" → "b.com")
  function domainOf(email) {
    const part = (email || '').split('@')[1]
    return part ? part.toLowerCase() : ''
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'

    // Basic email shape first.
    const emailErr = validateEmail(form.email)
    if (emailErr) {
      errs.email = emailErr
    } else if (domain && domainOf(form.email) !== domain.toLowerCase()) {
      // Domain enforcement (only when we know the school's domain).
      errs.email = `Email must be on the @${domain} domain`
    }

    if (!form.role) errs.role = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    invite(
      { email: form.email, name: form.name, role: form.role },
      {
        onSuccess: () => {
          setSentTo(form.email)
          // Reset the form but keep the role selection for quick repeat invites.
          setForm({ name: '', email: '', role: onlyRole || form.role })
          setErrors({})
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520,
      }}>
        {/* Inline success message after a successful invite */}
        {sentTo && (
          <div style={{
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
            fontSize: '0.82rem', color: 'var(--success)',
          }}>
            Invitation sent to <strong>{sentTo}</strong>. They will receive a temporary
            password by email — they can log in and change it later.
          </div>
        )}

        {/* Full name */}
        <Input
          label="Full name"
          value={form.name}
          onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })) }}
          placeholder="e.g. Anita Verma"
          error={errors.name}
          required
        />

        {/* Email */}
        <Input
          label="Email address"
          type="email"
          value={form.email}
          onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })) }}
          placeholder={domain ? `name@${domain}` : 'name@school.edu'}
          hint={domain ? `Must be a @${domain} address` : undefined}
          error={errors.email}
          required
        />

        {/* Role — dropdown when more than one choice, fixed label otherwise */}
        {roleOptions.length > 1 ? (
          <Select
            label="Role"
            value={form.role}
            onChange={e => { setForm(p => ({ ...p, role: e.target.value })); setErrors(p => ({ ...p, role: '' })) }}
            options={roleOptions}
            placeholder="Select role"
            error={errors.role}
            required
          />
        ) : (
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Role
            </label>
            <div style={{
              padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)', background: 'var(--bg-input)',
              color: 'var(--text-primary)', fontSize: '0.875rem',
            }}>
              {roleOptions[0]?.label ?? 'Faculty'}
            </div>
          </div>
        )}

        <Button type="submit" variant="primary" loading={isPending} loadingText="Sending invite..."
          style={{ alignSelf: 'flex-start' }}>
          Send invite
        </Button>
      </div>
    </form>
  )
}

export default FacultyInviteForm
