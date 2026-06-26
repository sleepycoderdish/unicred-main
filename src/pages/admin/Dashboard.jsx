// src/pages/admin/Dashboard.jsx
import { Link } from 'react-router-dom'
import { PageHeader }    from '@/components/ui/PageHeader'
import { useDepartments } from '@/hooks/useDepartments'
import { useFaculties }   from '@/hooks/useFaculties'

function QuickStatCard({ title, value, subtitle, to, color='var(--accent)' }) {
  return (
    <Link to={to} style={{ textDecoration:'none', flex:1, minWidth:180 }}>
      <div
        style={{ background:'rgba(22,27,39,0.75)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'var(--radius-lg)', padding:'24px', cursor:'pointer', transition:'border-color 0.2s, transform 0.15s' }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor=color; e.currentTarget.style.transform='translateY(-2px)' }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='translateY(0)' }}
      >
        <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{title}</p>
        <p style={{ fontSize:'2.2rem', fontWeight:700, color, margin:'0 0 6px', fontFamily:'var(--font-display)' }}>{value??'—'}</p>
        <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', margin:0 }}>{subtitle}</p>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const { data:departments=[], isLoading:dLoading } = useDepartments()
  const { data:faculties=[],   isLoading:fLoading } = useFaculties()
  const withHod    = departments.filter(d=>d.hodUserId!==null).length
  const withoutHod = departments.length - withHod

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="School-wide overview and management" />
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:40 }}>
        <QuickStatCard title="Departments" value={dLoading?'…':departments.length} subtitle="Total departments"    to="/admin/departments" color="var(--text-accent)" />
        <QuickStatCard title="HOD Assigned" value={dLoading?'…':withHod}          subtitle={`${withoutHod} pending`} to="/admin/departments" color="var(--success)" />
        <QuickStatCard title="Faculty"       value={fLoading?'…':faculties.length} subtitle="Total faculty"        to="/admin/faculties"   color="var(--accent-sky)" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:16 }}>
        {[
          { title:'Manage Departments', desc:'Create departments and assign HODs.', path:'/admin/departments', color:'var(--accent)' },
          { title:'View Faculty',       desc:'Browse faculty and filter by department.', path:'/admin/faculties', color:'var(--accent-sky)' },
          { title:'Timetables',         desc:'Review and approve timetables.', path:'/admin/timetables', color:'var(--success)' },
          { title:'Audit Logs',         desc:'View auth and system events.', path:'/admin/audit', color:'var(--warning)' },
        ].map(({title,desc,path,color})=>(
          <Link key={path} to={path} style={{ textDecoration:'none' }}>
            <div
              style={{ background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-lg)', padding:'20px', cursor:'pointer', transition:'border-color 0.15s, background 0.15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=color; e.currentTarget.style.background='var(--bg-elevated)' }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.background='var(--bg-surface)' }}
            >
              <h3 style={{ margin:'0 0 8px', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)' }}>{title}</h3>
              <p style={{ margin:0, fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
