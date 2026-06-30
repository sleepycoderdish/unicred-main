// src/config/roleConfig.js
// ─────────────────────────────────────────────────────────────
// Maps each user role to its sidebar navigation, allowed routes,
// and dashboard path. Used by RoleGuard and Sidebar to render
// the correct navigation without any role-specific if/else logic
// scattered across components.
// ─────────────────────────────────────────────────────────────

import { ROLES, ROUTES } from '@/config/constants'

// Each nav item: { label, path, icon (Lucide icon name string) }
export const ROLE_CONFIG = {
  [ROLES.STUDENT]: {
    dashboardPath: ROUTES.STUDENT_DASHBOARD,
    label: 'Student',
    nav: [
      { label: 'Dashboard',        path: '/student',                  icon: 'LayoutDashboard' },
      { label: 'Subjects',         path: '/student/subjects',         icon: 'BookOpen' },
      { label: 'My Session',       path: '/student/session',          icon: 'Calendar' },
      { label: 'Results',          path: '/student/results',          icon: 'BarChart2' },
      { label: 'CGPA',             path: '/student/cgpa',             icon: 'TrendingUp' },
      { label: 'Reappear',         path: '/student/reappear',         icon: 'RefreshCcw' },
      { label: 'Attendance',       path: '/student/attendance',       icon: 'CalendarCheck' },
      { label: 'Internal Marks',   path: '/student/assessments',      icon: 'ClipboardList' },
      { label: 'Students',         path: '/hod/students',             icon: 'Users' },
      { label: 'Timetable',        path: '/student/timetable',        icon: 'Clock' },
      { label: 'My Profile',       path: '/student/profile',          icon: 'User' },
    ],
  },

  [ROLES.FACULTY]: {
    dashboardPath: ROUTES.FACULTY_DASHBOARD,
    label: 'Faculty',
    nav: [
      { label: 'Dashboard',        path: '/faculty',                  icon: 'LayoutDashboard' },
      { label: 'My Profile',       path: '/faculty/profile',          icon: 'User' },
      { label: 'My Assignments',   path: '/faculty/assignments',      icon: 'BookOpen' },
      { label: 'Attendance',       path: '/faculty/attendance',       icon: 'CalendarCheck' },
      { label: 'Upload Marks',     path: '/faculty/marks',            icon: 'Upload' },
      { label: 'Reappear Marks',   path: '/faculty/reappear',         icon: 'RefreshCcw' },
      { label: 'Assessments',      path: '/faculty/assessments',      icon: 'ClipboardList' },
      { label: 'Students',         path: '/hod/students',             icon: 'Users' },
      { label: 'Timetable',        path: '/faculty/timetable',        icon: 'Clock' },
      { label: 'Announcements',    path: '/faculty/announcements',    icon: 'Megaphone' },
    ],
  },

  [ROLES.HOD]: {
    dashboardPath: ROUTES.HOD_DASHBOARD,
    label: 'Head of Department',
    nav: [
      { label: 'Dashboard',        path: '/hod',                      icon: 'LayoutDashboard' },
      { label: 'Invite Faculty',   path: '/hod/invite',               icon: 'UserPlus' },
      { label: 'My Profile',       path: '/faculty/profile',          icon: 'User' },
      { label: 'Sessions',         path: '/hod/sessions',             icon: 'CalendarRange' },
      { label: 'Subjects',         path: '/hod/subjects',             icon: 'BookOpen' },
      { label: 'Assignments',      path: '/hod/assignments',          icon: 'Users' },
      { label: 'Results',          path: '/hod/results',              icon: 'BarChart2' },
      { label: 'Reappear',         path: '/hod/reappear',             icon: 'RefreshCcw' },
      { label: 'Students',         path: '/hod/students',             icon: 'Users' },
      { label: 'Timetable',        path: '/hod/timetable',            icon: 'Clock' },
      { label: 'Announcements',    path: '/hod/announcements',        icon: 'Megaphone' },
    ],
  },

  [ROLES.ADMIN]: {
    dashboardPath: ROUTES.ADMIN_DASHBOARD,
    label: 'Admin',
    nav: [
      { label: 'Dashboard',        path: '/admin',                    icon: 'LayoutDashboard' },
      { label: 'Invite Member',    path: '/admin/invite',             icon: 'UserPlus' },
      { label: 'Timetables',       path: '/admin/timetables',         icon: 'Clock' },
      { label: 'Departments',      path: '/admin/departments',        icon: 'Building2' },
      { label: 'Settings',         path: '/admin/settings',           icon: 'Settings' },
      { label: 'Audit Logs',       path: '/admin/audit',              icon: 'Shield' },
    ],
  },
}

/**
 * Returns the nav config for a given role.
 * @param {string} role - One of ROLES.*
 * @returns {{ dashboardPath: string, label: string, nav: Array }}
 */
export function getRoleConfig(role) {
  return ROLE_CONFIG[role] ?? ROLE_CONFIG[ROLES.STUDENT]
}

/**
 * Returns the dashboard redirect path for a given role.
 * @param {string} role
 * @returns {string} - Route path
 */
export function getDashboardPath(role) {
  return ROLE_CONFIG[role]?.dashboardPath ?? ROUTES.STUDENT_DASHBOARD
}