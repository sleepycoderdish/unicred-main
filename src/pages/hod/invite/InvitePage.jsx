// src/pages/hod/invite/InvitePage.jsx
// ─────────────────────────────────────────────────────────────
// HOD invites new FACULTY members (only). The role is fixed to "faculty".
//
// The invited faculty later chooses their department themselves on the
// "Complete Profile" page (the invite itself carries no department).
//
// School domain is taken from the HOD's own faculty record (their email
// shares the school domain). An HOD always has a faculty record.
// ─────────────────────────────────────────────────────────────

import { PageHeader }         from '@/components/ui/PageHeader'
import { FacultyInviteForm }  from '@/components/forms/FacultyInviteForm'
import { useMyFaculty }       from '@/hooks/useFaculties'

// HOD can only invite faculty — single fixed role.
const HOD_ROLE_OPTIONS = [
  { value: 'faculty', label: 'Faculty' },
]

export default function HodInvitePage() {
  // The HOD's own email gives us the school domain to enforce.
  const { data: myFaculty } = useMyFaculty()
  const myEmail = myFaculty?.user?.email || ''
  const domain = myEmail.includes('@') ? myEmail.split('@')[1] : null

  return (
    <div>
      <PageHeader
        title="Invite Faculty"
        subtitle="Invite a faculty member to your school. They receive a temporary password by email."
      />
      <FacultyInviteForm roleOptions={HOD_ROLE_OPTIONS} domain={domain} />
    </div>
  )
}
