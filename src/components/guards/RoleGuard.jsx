// src/components/guards/RoleGuard.jsx
// ─────────────────────────────────────────────────────────────
// Restricts a route to users with the correct role(s).
//
// Usage in router.jsx:
//   <RoleGuard allowedRoles={[ROLES.HOD, ROLES.ADMIN]}>
//     <HodDashboard />
//   </RoleGuard>
//
// If the user's role is not in allowedRoles:
//   → Redirect to their own dashboard (not a 404 or blank page)
//
// Always nest RoleGuard inside ProtectedRoute — it assumes the user
// is already authenticated.
// ─────────────────────────────────────────────────────────────

import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/auth.store'
import { getDashboardPath } from '@/config/roleConfig'

/**
 * RoleGuard
 *
 * @param {Object} props
 * @param {string[]}         props.allowedRoles - Array of ROLES.* constants
 * @param {React.ReactNode}  props.children
 */
export function RoleGuard({ allowedRoles, children }) {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  // Check if the current user's role is in the allowed list
  const hasAccess = allowedRoles.includes(role)

  if (!hasAccess) {
    // Redirect to their own dashboard instead of a blank page or 404
    const theirDashboard = getDashboardPath(role)
    return <Navigate to={theirDashboard} replace />
  }

  return children
}

/**
 * RoleAwarePage — convenience wrapper that picks the right component per role.
 * Use this instead of nested RoleGuards when one route renders different UIs.
 *
 * Usage:
 *   <RoleAwarePage
 *     pages={{
 *       [ROLES.STUDENT]: <StudentDashboard />,
 *       [ROLES.FACULTY]: <FacultyDashboard />,
 *       [ROLES.HOD]:     <HodDashboard />,
 *       [ROLES.ADMIN]:   <AdminDashboard />,
 *     }}
 *   />
 *
 * @param {{ pages: Record<string, React.ReactNode> }} props
 */
export function RoleAwarePage({ pages }) {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  const component = pages[role]

  if (!component) {
    // Fallback: redirect to their dashboard if no page is defined for this role
    return <Navigate to={getDashboardPath(role)} replace />
  }

  return component
}

export default RoleGuard
