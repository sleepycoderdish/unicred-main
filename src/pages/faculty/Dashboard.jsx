// src/pages/faculty/Dashboard.jsx — Stub (replace with full page)
import useAuthStore from '@/store/auth.store'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
export default function FacultyDashboard() {
  const user = useAuthStore((s) => s.user)
  const { logout, loading } = useAuth()
  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16,background:'var(--bg-base)',color:'var(--text-primary)',fontFamily:'var(--font-sans)' }}>
      <h1 style={{ fontSize:'1.5rem',fontWeight:700 }}>Faculty Dashboard</h1>
      <p style={{ color:'var(--text-secondary)',fontSize:'0.875rem' }}>Role: <strong>{user?.role}</strong></p>
      <Button variant="secondary" loading={loading} onClick={logout}>Sign out</Button>
    </div>
  )
}
