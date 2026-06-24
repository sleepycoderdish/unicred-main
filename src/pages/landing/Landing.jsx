// src/pages/landing/Landing.jsx — Stub (replace with full landing page)
import { Link } from 'react-router-dom'
import { ROUTES, APP_NAME } from '@/config/constants'
export default function Landing() {
  return (
    <div style={{ minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24,background:'var(--bg-base)',color:'var(--text-primary)',fontFamily:'var(--font-sans)',textAlign:'center',padding:'0 24px' }}>
      <img src="/unicred-logo.png" alt={APP_NAME} style={{ width:80,height:80,filter:'drop-shadow(0 0 16px rgba(99,102,241,0.5)) brightness(1.15)' }} />
      <h1 style={{ fontSize:'2.5rem',fontWeight:800,fontFamily:'var(--font-display)' }}>{APP_NAME}</h1>
      <p style={{ fontSize:'1rem',color:'var(--text-secondary)',maxWidth:480 }}>Academic Management Platform for modern universities.</p>
      <div style={{ display:'flex',gap:12 }}>
        <Link to={ROUTES.LOGIN} style={{ padding:'10px 24px',background:'var(--accent)',color:'#fff',borderRadius:'var(--radius-sm)',textDecoration:'none',fontWeight:600,fontSize:'0.875rem' }}>Sign in</Link>
        <Link to={ROUTES.REGISTER} style={{ padding:'10px 24px',background:'transparent',color:'var(--text-primary)',border:'1px solid var(--border-strong)',borderRadius:'var(--radius-sm)',textDecoration:'none',fontWeight:600,fontSize:'0.875rem' }}>Register</Link>
      </div>
    </div>
  )
}
