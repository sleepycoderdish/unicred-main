// src/pages/admin/invite/InvitePage.jsx
// ─────────────────────────────────────────────────────────────
// Admin invites new users. An admin may invite a FACULTY or an HOD.
//
// School domain:
//   The invitee's email must be on the school's domain. The token doesn't
//   carry that domain, so we derive it from an existing faculty's email
//   (every faculty shares the school domain). If no faculty exists yet, the
//   domain stays unknown and the backend enforces it instead.
// ─────────────────────────────────────────────────────────────

import { PageHeader }         from '@/components/ui/PageHeader'
import { FacultyInviteForm }  from '@/components/forms/FacultyInviteForm'
import { useFaculties }       from '@/hooks/useFaculties'

// Admin can invite these two roles only (not student, not another admin).
const ADMIN_ROLE_OPTIONS = [
  { value: 'faculty', label: 'Faculty' },
  { value: 'hod',     label: 'Head of Department (HOD)' },
]

export default function AdminInvitePage() {
  // Pull the school domain from any existing faculty's email.
  const { data: faculties = [] } = useFaculties()
  const firstEmail = faculties[0]?.user?.email || ''
  const domain = firstEmail.includes('@') ? firstEmail.split('@')[1] : null

  return (
    <div>
      <PageHeader
        title="Invite Member"
        subtitle="Invite a faculty member or HOD. They receive a temporary password by email."
      />
      <FacultyInviteForm roleOptions={ADMIN_ROLE_OPTIONS} domain={domain} />
    </div>
  )
}
