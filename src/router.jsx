// src/router.jsx
// ─────────────────────────────────────────────────────────────
// Step 7 — All client-side routes defined here.
//
// Route structure:
//   /                    → Landing page (public)
//   /auth/*              → Auth pages (public, outside AppShell)
//   /student/*           → Student dashboard (ProtectedRoute + RoleGuard)
//   /faculty/*           → Faculty dashboard (ProtectedRoute + RoleGuard)
//   /hod/*               → HOD dashboard (ProtectedRoute + RoleGuard)
//   /admin/*             → Admin dashboard (ProtectedRoute + RoleGuard)
//
// Lazy loading:
//   All dashboard pages are lazy-loaded (code-split) so the initial
//   bundle stays small. Auth pages are eagerly imported since they're
//   often the first thing the user sees.
//
// ProtectedRoute:
//   Wraps all /student, /faculty, /hod, /admin routes.
//   Checks auth state and attempts silent token refresh on mount.
//
// RoleGuard:
//   Nested inside ProtectedRoute. Ensures the user's role matches
//   the route they're trying to access.
// ─────────────────────────────────────────────────────────────

// src/router.jsx — Updated with AppShell + admin sub-routes
import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'
import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import { RoleGuard }      from '@/components/guards/RoleGuard'
import { PageLoader }     from '@/components/ui/Loader'
import { AppShell }       from '@/layouts/AppShell'
import { ROLES, ROUTES }  from '@/config/constants'
import useAuthStore        from '@/store/auth.store'

/**
 * NotFound — 404 page.
 * "Go back" destination is role-aware:
 *   Authenticated   → their role dashboard (session stays intact, no reload)
 *   Unauthenticated → landing page
 */
function NotFound() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const getDashboard    = useAuthStore(s => s.getDashboard)
  const destination     = isAuthenticated ? getDashboard() : ROUTES.LANDING

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:16, color:'var(--text-secondary)', fontFamily:'var(--font-sans)' }}>
      <h1 style={{ fontSize:'4rem', color:'var(--text-muted)', margin:0 }}>404</h1>
      <p>Page not found.</p>
      <Link to={destination} style={{ color:'var(--accent-sky)', fontSize:'0.875rem' }}>
        {isAuthenticated ? 'Go to dashboard' : 'Go home'}
      </Link>
    </div>
  )
}

// Eager
import Login          from '@/pages/auth/Login'
import Register       from '@/pages/auth/Register'
import VerifyEmail    from '@/pages/auth/VerifyEmail'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword  from '@/pages/auth/ResetPassword'

// Lazy — admin
const AdminDashboard  = lazy(() => import('@/pages/admin/Dashboard'))
const DepartmentsPage = lazy(() => import('@/pages/admin/departments/DepartmentsPage'))
const FacultiesPage   = lazy(() => import('@/pages/admin/faculties/FacultiesPage'))

// Lazy — other roles
const StudentDashboard = lazy(() => import('@/pages/student/Dashboard'))
const FacultyDashboard = lazy(() => import('@/pages/faculty/Dashboard'))
const HodDashboard     = lazy(() => import('@/pages/hod/Dashboard'))
const Landing          = lazy(() => import('@/pages/landing/Landing'))

// Lazy — admin sub-pages
const GradingSystemPage  = lazy(() => import('@/pages/admin/grading/GradingSystemPage'))
const AdminInvitePage    = lazy(() => import('@/pages/admin/invite/InvitePage'))

// Lazy — HOD sub-pages
const HodInvitePage      = lazy(() => import('@/pages/hod/invite/InvitePage'))

// Lazy — invited-member profile completion (faculty + hod share this page)
const FacultyProfilePage = lazy(() => import('@/pages/faculty/profile/ProfilePage'))

// Lazy — HOD sub-pages
const StudentRegistrationPage = lazy(() => import('@/pages/hod/students/StudentRegistrationPage'))
const PublicationsPage   = lazy(() => import('@/pages/hod/results/PublicationsPage'))
const PublicationReview  = lazy(() => import('@/pages/hod/results/PublicationReview'))
const ReappearReviewPage = lazy(() => import('@/pages/hod/reappear/ReappearReviewPage'))
const SessionsPage       = lazy(() => import('@/pages/hod/sessions/SessionsPage'))
const SubjectsPage       = lazy(() => import('@/pages/hod/subjects/SubjectsPage'))
const HodAssignmentsPage = lazy(() => import('@/pages/hod/assignments/HodAssignmentsPage'))
const TimetablePage      = lazy(() => import('@/pages/hod/timetable/TimetablePage'))

// Lazy — Faculty sub-pages
const MarkUploadPage     = lazy(() => import('@/pages/faculty/results/MarkUploadPage'))
const ReappearMarksPage  = lazy(() => import('@/pages/faculty/reappear/ReappearMarksPage'))
const AssignmentsPage    = lazy(() => import('@/pages/faculty/assignments/AssignmentsPage'))
const AssessmentsPage    = lazy(() => import('@/pages/faculty/assessments/AssessmentsPage'))

// Lazy — Student sub-pages
const MySessionPage        = lazy(() => import('@/pages/student/session/MySessionPage'))
const ResultsPage          = lazy(() => import('@/pages/student/results/ResultsPage'))
const CgpaPage             = lazy(() => import('@/pages/student/results/CgpaPage'))
const StudentReappearPage  = lazy(() => import('@/pages/student/reappear/ReappearPage'))
const MyProfilePage        = lazy(() => import('@/pages/student/profile/StudentProfilePage'))
const StudentSubjectsPage  = lazy(() => import('@/pages/student/subjects/SubjectsPage'))
const SubjectDetailPage    = lazy(() => import('@/pages/student/subjects/SubjectDetailPage'))

const Fallback = () => <PageLoader message="Loading..." />

/**
 * guardedPage — wraps a page in ProtectedRoute + RoleGuard + AppShell.
 * All dashboard routes go through this so sidebar/layout is consistent.
 */
function guardedPage(element, allowedRoles) {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={allowedRoles}>
        <AppShell>
          <Suspense fallback={<Fallback />}>{element}</Suspense>
        </AppShell>
      </RoleGuard>
    </ProtectedRoute>
  )
}

const router = createBrowserRouter([
  // Public
  { path: '/',                      element: <Suspense fallback={<Fallback />}><Landing /></Suspense> },
  { path: '/auth/login',            element: <Login /> },
  { path: '/auth/register',         element: <Register /> },
  { path: '/auth/verify-email',     element: <VerifyEmail /> },
  { path: '/auth/forgot-password',  element: <ForgotPassword /> },
  { path: '/auth/reset-password',   element: <ResetPassword /> },

  // Admin
  { path: '/admin',                 element: guardedPage(<AdminDashboard />,  [ROLES.ADMIN]) },
  { path: '/admin/departments',     element: guardedPage(<DepartmentsPage />, [ROLES.ADMIN]) },
  { path: '/admin/faculties',       element: guardedPage(<FacultiesPage />,   [ROLES.ADMIN]) },

  // Student
  { path: '/student',               element: guardedPage(<StudentDashboard />, [ROLES.STUDENT]) },

  // Faculty
  { path: '/faculty',               element: guardedPage(<FacultyDashboard />, [ROLES.FACULTY]) },

  // HOD
  { path: '/hod',                   element: guardedPage(<HodDashboard />,     [ROLES.HOD]) },

  // Admin sub-routes
  { path: '/admin/grading',        element: guardedPage(<GradingSystemPage />,  [ROLES.ADMIN]) },
  { path: '/admin/invite',         element: guardedPage(<AdminInvitePage />,    [ROLES.ADMIN]) },

  // HOD sub-routes
  { path: '/hod/sessions',         element: guardedPage(<SessionsPage />,       [ROLES.HOD]) },
  { path: '/hod/subjects',         element: guardedPage(<SubjectsPage />,       [ROLES.HOD]) },
  { path: '/hod/assignments',      element: guardedPage(<HodAssignmentsPage />, [ROLES.HOD]) },
  { path: '/hod/results',          element: guardedPage(<PublicationsPage />,   [ROLES.HOD]) },
  { path: '/hod/results/:id',      element: guardedPage(<PublicationReview />,  [ROLES.HOD]) },
  { path: '/hod/reappear',         element: guardedPage(<ReappearReviewPage />, [ROLES.HOD]) },
  { path: '/hod/timetable',        element: guardedPage(<TimetablePage />,            [ROLES.HOD]) },
  { path: '/hod/students',         element: guardedPage(<StudentRegistrationPage />, [ROLES.HOD]) },
  { path: '/hod/invite',           element: guardedPage(<HodInvitePage />,           [ROLES.HOD]) },

  // Invited member completes their own profile (faculty or hod)
  { path: '/faculty/profile',      element: guardedPage(<FacultyProfilePage />, [ROLES.FACULTY, ROLES.HOD]) },

  // Faculty sub-routes
  { path: '/faculty/assignments',  element: guardedPage(<AssignmentsPage />,    [ROLES.FACULTY, ROLES.HOD]) },
  { path: '/faculty/marks',        element: guardedPage(<MarkUploadPage />,     [ROLES.FACULTY, ROLES.HOD]) },
  { path: '/faculty/assessments',  element: guardedPage(<AssessmentsPage />,    [ROLES.FACULTY, ROLES.HOD]) },
  { path: '/faculty/reappear',     element: guardedPage(<ReappearMarksPage />,  [ROLES.FACULTY, ROLES.HOD]) },

  // Student sub-routes
  { path: '/student/results',              element: guardedPage(<ResultsPage />,          [ROLES.STUDENT]) },
  { path: '/student/cgpa',                 element: guardedPage(<CgpaPage />,             [ROLES.STUDENT]) },
  { path: '/student/reappear',             element: guardedPage(<StudentReappearPage />,  [ROLES.STUDENT]) },
  { path: '/student/session',              element: guardedPage(<MySessionPage />,         [ROLES.STUDENT]) },
  { path: '/student/myProfile',            element: guardedPage(<MyProfilePage />,         [ROLES.STUDENT]) },
  { path: '/student/subjects',             element: guardedPage(<StudentSubjectsPage />,   [ROLES.STUDENT]) },
  { path: '/student/subjects/:subjectId',  element: guardedPage(<SubjectDetailPage />,     [ROLES.STUDENT]) },

  // 404
  { path: '*', element: <NotFound /> },
])

export function AppRouter() { return <RouterProvider router={router} /> }
export default AppRouter