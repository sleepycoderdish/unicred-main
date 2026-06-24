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

import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import { RoleGuard }      from '@/components/guards/RoleGuard'
import { PageLoader }     from '@/components/ui/Loader'
import { ROLES }          from '@/config/constants'

// ── Eager imports (auth + landing) ───────────────────────────
import Login          from '@/pages/auth/Login'
import Register       from '@/pages/auth/Register'
import VerifyEmail    from '@/pages/auth/VerifyEmail'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword  from '@/pages/auth/ResetPassword'

// ── Lazy imports (dashboard pages — code split per role) ──────
// Student pages
const StudentDashboard  = lazy(() => import('@/pages/student/Dashboard'))

// Faculty pages
const FacultyDashboard  = lazy(() => import('@/pages/faculty/Dashboard'))

// HOD pages
const HodDashboard      = lazy(() => import('@/pages/hod/Dashboard'))

// Admin pages
const AdminDashboard    = lazy(() => import('@/pages/admin/Dashboard'))

// Landing page
const Landing           = lazy(() => import('@/pages/landing/Landing'))

// ── Suspense fallback ─────────────────────────────────────────
// Shown while lazy-loaded chunks are downloading.
const LazyFallback = () => <PageLoader message="Loading..." />

// ── Router configuration ──────────────────────────────────────
const router = createBrowserRouter([
  // ── Public: Landing ────────────────────────────────────────
  {
    path: '/',
    element: (
      <Suspense fallback={<LazyFallback />}>
        <Landing />
      </Suspense>
    ),
  },

  // ── Public: Auth pages (no AppShell, no sidebar) ───────────
  {
    path: '/auth/login',
    element: <Login />,
  },
  {
    path: '/auth/register',
    element: <Register />,
  },
  {
    path: '/auth/verify-email',
    element: <VerifyEmail />,
  },
  {
    path: '/auth/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/auth/reset-password',
    element: <ResetPassword />,
  },

  // ── Protected: Student routes ──────────────────────────────
  {
    path: '/student',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={[ROLES.STUDENT]}>
          <Suspense fallback={<LazyFallback />}>
            <StudentDashboard />
          </Suspense>
        </RoleGuard>
      </ProtectedRoute>
    ),
  },

  // ── Protected: Faculty routes ──────────────────────────────
  {
    path: '/faculty',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={[ROLES.FACULTY]}>
          <Suspense fallback={<LazyFallback />}>
            <FacultyDashboard />
          </Suspense>
        </RoleGuard>
      </ProtectedRoute>
    ),
  },

  // ── Protected: HOD routes ──────────────────────────────────
  {
    path: '/hod',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={[ROLES.HOD]}>
          <Suspense fallback={<LazyFallback />}>
            <HodDashboard />
          </Suspense>
        </RoleGuard>
      </ProtectedRoute>
    ),
  },

  // ── Protected: Admin routes ────────────────────────────────
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={[ROLES.ADMIN]}>
          <Suspense fallback={<LazyFallback />}>
            <AdminDashboard />
          </Suspense>
        </RoleGuard>
      </ProtectedRoute>
    ),
  },

  // ── 404 catch-all ──────────────────────────────────────────
  {
    path: '*',
    element: (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: 16,
        color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)',
      }}>
        <h1 style={{ fontSize: '4rem', color: 'var(--text-muted)', margin: 0 }}>404</h1>
        <p>Page not found.</p>
        <a href="/" style={{ color: 'var(--accent-sky)', fontSize: '0.875rem' }}>
          Go home
        </a>
      </div>
    ),
  },
])

/**
 * AppRouter — renders the router. Mount in App.jsx.
 */
export function AppRouter() {
  return <RouterProvider router={router} />
}

export default AppRouter
