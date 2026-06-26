// src/pages/landing/Landing.jsx
// Clean, professional landing page for Unicred.
// Animations: subtle fade-up on scroll + one gentle float on hero card.
// No excessive effects — glass only on key surfaces.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES, APP_NAME } from '@/config/constants'

// ─── Inject minimal CSS once ────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.14);border-radius:99px}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes gtext{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
  .rv{opacity:0;transition:none}
  .rv.on{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
  .d1{animation-delay:.08s!important}.d2{animation-delay:.16s!important}
  .d3{animation-delay:.24s!important}.d4{animation-delay:.32s!important}
  .d5{animation-delay:.40s!important}.d6{animation-delay:.48s!important}
  .fc{transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease;cursor:default}
  .fc:hover{transform:translateY(-5px);border-color:rgba(99,102,241,.35)!important;box-shadow:0 16px 40px rgba(0,0,0,.3)!important}
  .nl{text-decoration:none;color:rgba(148,163,184,.85);font-size:.875rem;font-weight:500;transition:color .15s}
  .nl:hover{color:#f1f5f9}
`

function useCSS() {
  useEffect(() => {
    if (document.getElementById('uc-css')) return
    const s = document.createElement('style')
    s.id = 'uc-css'
    s.textContent = CSS
    document.head.appendChild(s)
  }, [])
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.rv')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on') }),
      { threshold: 0.1 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// Gradient text applied only to headline accents
const GT = {
  background: 'linear-gradient(120deg,#a5b4fc,#38bdf8)',
  backgroundSize: '200% 200%',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: 'gtext 5s ease infinite',
}

// ─── Shared layout ──────────────────────────────────────────
function Wrap({ children, style = {} }) {
  return <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', ...style }}>{children}</div>
}

function SectionTag({ children }) {
  return (
    <span style={{
      display: 'inline-block',
      background: 'rgba(99,102,241,.1)',
      border: '1px solid rgba(99,102,241,.28)',
      borderRadius: 99,
      padding: '4px 14px',
      fontSize: '.72rem',
      fontWeight: 600,
      color: '#a5b4fc',
      letterSpacing: '.07em',
      textTransform: 'uppercase',
      marginBottom: 16,
    }}>{children}</span>
  )
}

// ─── Mini mock dashboard shown in hero ──────────────────────
function MockDash() {
  return (
    <div style={{
      background: 'rgba(15,17,23,.95)',
      border: '1px solid rgba(255,255,255,.1)',
      borderRadius: 18,
      overflow: 'hidden',
      fontFamily: 'Inter,sans-serif',
      boxShadow: '0 24px 64px rgba(0,0,0,.6)',
      width: '100%',
      maxWidth: 480,
    }}>
      {/* Titlebar */}
      <div style={{ background: 'rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.07)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
        {['#f87171','#fbbf24','#34d399'].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: .75 }} />
        ))}
        <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'rgba(148,163,184,.5)', letterSpacing: '.01em' }}>
          unicred.app/student
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <div style={{ width: 48, borderRight: '1px solid rgba(255,255,255,.06)', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(99,102,241,.25)', border: '1px solid rgba(99,102,241,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 12, height: 2, background: '#818cf8', borderRadius: 2 }} />
          </div>
          {[
            'rgba(56,189,248,.35)',
            'rgba(52,211,153,.35)',
            'rgba(251,191,36,.35)',
            'rgba(148,163,184,.2)',
          ].map((c, i) => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${c}`, background: 'transparent' }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Dashboard</div>
              <div style={{ fontSize: 10, color: 'rgba(148,163,184,.55)', marginTop: 1 }}>Semester 5 · EE Batch 2022</div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,.2)', border: '1px solid rgba(99,102,241,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#818cf8' }}>RS</div>
          </div>

          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { l: 'CGPA',  v: '8.4', c: '#818cf8', bg: 'rgba(99,102,241,.1)' },
              { l: 'Attend', v: '87%', c: '#34d399', bg: 'rgba(52,211,153,.1)' },
              { l: 'Rank',   v: '#12',  c: '#38bdf8', bg: 'rgba(56,189,248,.1)' },
            ].map(k => (
              <div key={k.l} style={{ background: k.bg, border: `1px solid ${k.c}30`, borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: k.c, fontFamily: 'Outfit,sans-serif' }}>{k.v}</div>
                <div style={{ fontSize: 9, color: 'rgba(148,163,184,.6)', marginTop: 1, textTransform: 'uppercase', letterSpacing: '.05em' }}>{k.l}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div>
            <div style={{ fontSize: 10, color: 'rgba(148,163,184,.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Subject Performance</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 44 }}>
              {[88, 76, 91, 83, 70].map((h, i) => (
                <div key={i} style={{ flex: 1, background: i === 2 ? 'rgba(99,102,241,.65)' : 'rgba(99,102,241,.22)', borderRadius: '3px 3px 0 0', height: `${h * .46}px` }} />
              ))}
            </div>
          </div>

          {/* Result rows */}
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 9, color: 'rgba(148,163,184,.45)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Recent Results</span>
              <span style={{ fontSize: 9, color: '#818cf8' }}>View all →</span>
            </div>
            {[['Data Structures', 88], ['Digital Circuits', 76], ['Mathematics III', 91]].map(([name, mark]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <span style={{ fontSize: 10, color: 'rgba(241,245,249,.8)', fontWeight: 500 }}>{name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: mark >= 85 ? '#34d399' : '#818cf8' }}>{mark}/100</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── NAV ────────────────────────────────────────────────────
function Nav() {
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const fn = () => setStuck(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 60,
      background: stuck ? 'rgba(15,17,23,.9)' : 'transparent',
      borderBottom: stuck ? '1px solid rgba(255,255,255,.07)' : '1px solid transparent',
      backdropFilter: stuck ? 'blur(18px)' : 'none',
      WebkitBackdropFilter: stuck ? 'blur(18px)' : 'none',
      transition: 'background .25s, border-color .25s',
    }}>
      <Wrap style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <img
            src="/unicred-logo.png"
            alt={APP_NAME}
            style={{ width: 30, height: 30, filter: 'drop-shadow(0 0 6px rgba(99,102,241,.5)) brightness(1.1)' }}
          />
          <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1rem', color: '#f1f5f9', letterSpacing: '-.01em' }}>
            {APP_NAME}
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {[['#features','Features'],['#workflow','Workflow'],['#roles','Roles']].map(([h, l]) => (
            <a key={h} href={h} className="nl">{l}</a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link
            to={ROUTES.LOGIN}
            style={{ padding: '7px 16px', borderRadius: 8, fontSize: '.85rem', fontWeight: 600, color: '#94a3b8', textDecoration: 'none', transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            Sign in
          </Link>
          <Link
            to={ROUTES.REGISTER}
            style={{
              padding: '7px 18px', borderRadius: 8, fontSize: '.85rem', fontWeight: 700,
              background: '#6366f1', color: '#fff', textDecoration: 'none',
              boxShadow: '0 0 16px rgba(99,102,241,.3)',
              transition: 'box-shadow .2s, transform .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(99,102,241,.55)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(99,102,241,.3)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Get started →
          </Link>
        </div>
      </Wrap>
    </nav>
  )
}

// ─── HERO ────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 60, position: 'relative', overflow: 'hidden' }}>
      {/* Subtle grid */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      {/* Soft indigo glow top-left */}
      <div aria-hidden style={{ position: 'absolute', top: -120, left: -80, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,.14) 0%,transparent 65%)', filter: 'blur(48px)', pointerEvents: 'none' }} />
      {/* Soft sky glow bottom-right */}
      <div aria-hidden style={{ position: 'absolute', bottom: -80, right: -60, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(56,189,248,.1) 0%,transparent 65%)', filter: 'blur(48px)', pointerEvents: 'none' }} />

      <Wrap style={{ padding: '72px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', width: '100%' }}>
        {/* Left */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.28)', borderRadius: 99, padding: '5px 14px 5px 8px', marginBottom: 28 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(99,102,241,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>✦</div>
            <span style={{ fontSize: '.75rem', fontWeight: 600, color: '#a5b4fc', letterSpacing: '.04em' }}>Academic Management Platform</span>
          </div>

          <h1 style={{
            fontFamily: 'Outfit,sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2.2rem,4vw,3.4rem)',
            lineHeight: 1.1,
            letterSpacing: '-.025em',
            color: '#f1f5f9',
            marginBottom: 22,
          }}>
            Manage academics<br />
            the way they<br />
            <span style={GT}>should be managed</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: 36, maxWidth: 440 }}>
            Unicred gives students, faculty, HODs and admins a single unified platform — from result publishing to timetables, course management, and student portfolios.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              to={ROUTES.REGISTER}
              style={{
                padding: '12px 26px', borderRadius: 10, fontSize: '.95rem', fontWeight: 700,
                background: '#6366f1', color: '#fff', textDecoration: 'none',
                boxShadow: '0 0 24px rgba(99,102,241,.4)',
                transition: 'box-shadow .2s, transform .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 36px rgba(99,102,241,.6)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,.4)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Get started →
            </Link>
            <Link
              to={ROUTES.LOGIN}
              style={{
                padding: '12px 26px', borderRadius: 10, fontSize: '.95rem', fontWeight: 600,
                color: '#94a3b8', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,.1)',
                background: 'transparent',
                transition: 'border-color .15s, color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.22)'; e.currentTarget.style.color = '#f1f5f9' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#94a3b8' }}
            >
              Sign in
            </Link>
          </div>

          {/* Role pills */}
          <div style={{ marginTop: 40, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Student', c: '#38bdf8' },
              { label: 'Faculty', c: '#34d399' },
              { label: 'HOD',     c: '#818cf8' },
              { label: 'Admin',   c: '#fbbf24' },
            ].map(r => (
              <span key={r.label} style={{ padding: '4px 12px', borderRadius: 99, fontSize: '.75rem', fontWeight: 600, background: `${r.c}12`, border: `1px solid ${r.c}30`, color: r.c }}>
                {r.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right — mock dashboard */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
          <div style={{ animation: 'float 6s ease-in-out infinite', width: '100%' }}>
            <MockDash />
          </div>
          {/* Floating notification */}
          <div style={{
            position: 'absolute', bottom: 24, left: -16,
            background: 'rgba(22,27,39,.92)',
            border: '1px solid rgba(52,211,153,.3)',
            borderRadius: 12, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 24px rgba(0,0,0,.4)',
            animation: 'float 5s 1s ease-in-out infinite',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(52,211,153,.15)', border: '1px solid rgba(52,211,153,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>Results Published</div>
              <div style={{ fontSize: 10, color: 'rgba(148,163,184,.65)', marginTop: 1 }}>Semester 5 · EE 2022</div>
            </div>
          </div>
          {/* Second chip */}
          <div style={{
            position: 'absolute', top: 0, right: -12,
            background: 'rgba(22,27,39,.92)',
            border: '1px solid rgba(99,102,241,.3)',
            borderRadius: 12, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 24px rgba(0,0,0,.4)',
            animation: 'float 7s 0.5s ease-in-out infinite',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🔔</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>Timetable Approved</div>
              <div style={{ fontSize: 10, color: 'rgba(148,163,184,.65)', marginTop: 1 }}>Admin verified</div>
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  )
}

// ─── FEATURES ────────────────────────────────────────────────
const FEATURES = [
  { icon: '🗓', color: '#6366f1', title: 'Academic Session Management', desc: 'Create odd/even semesters and manage their full lifecycle — upcoming, active, completed, archived — with all records permanently accessible.' },
  { icon: '📊', color: '#38bdf8', title: 'Automated Result Compilation', desc: 'Faculty upload marks per subject. The system tracks who has submitted, shows a live progress bar, and notifies HOD when compilation is complete.' },
  { icon: '📅', color: '#34d399', title: 'Timetable with Approval Flow', desc: 'HOD builds the timetable, submits to Admin for verification. Conflict detection runs before any slot is saved. Students see it once approved.' },

  { icon: '🔒', color: '#f87171', title: 'Role-based Access Control', desc: 'Four completely isolated portals — Student, Faculty, HOD, Admin. JWT with refresh token rotation and per-device logout support.' },
  { icon: '📈', color: '#a78bfa', title: 'Student Portfolio & Analytics', desc: 'CGPA trends, subject performance, reappear history, plus a full profile with skills, projects, internships, achievements, and placements.' },
]

function FeaturesSection() {
  return (
    <section id="features" style={{ padding: '96px 0' }}>
      <Wrap>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="rv"><SectionTag>Features</SectionTag></div>
          <h2 className="rv d1" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.5rem)', color: '#f1f5f9', letterSpacing: '-.02em', lineHeight: 1.15, marginBottom: 14 }}>
            Everything your campus needs
          </h2>
          <p className="rv d2" style={{ fontSize: '1rem', color: '#64748b', maxWidth: 500, margin: '0 auto' }}>
            Built around real academic workflows — from session setup to result publication and beyond.
          </p>
        </div>

        {/*
          5-card layout: 6-column grid
          Row 1 — cards 0-2: each span 2 cols  → fills all 6 cols (3 equal cards)
          Row 2 — cards 3-4: span 2 cols each, starting at col 2 and col 4
                             → 1 empty col on each side, 2 cards perfectly centred
                             matching the same width as the row above
        */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18 }}>
          {FEATURES.map((f, i) => {
            // Determine grid-column placement
            // Cards 0,1,2 → auto (span 2 each fills the row)
            // Card 3 → col 2 span 2  |  Card 4 → col 4 span 2
            const colMap = {
              3: '2 / span 2',
              4: '4 / span 2',
            }
            return (
              <div
                key={f.title}
                className={`rv fc d${i + 1}`}
                style={{
                  gridColumn: colMap[i] ?? 'span 2',
                  background: 'rgba(22,27,39,.7)',
                  border: '1px solid rgba(255,255,255,.07)',
                  borderRadius: 16,
                  padding: '26px 26px 30px',
                }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 11, background: `${f.color}16`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8, fontFamily: 'Outfit,sans-serif' }}>{f.title}</h3>
                <p style={{ fontSize: '.85rem', color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
                <div style={{ height: 2, background: `linear-gradient(90deg,${f.color}55,transparent)`, borderRadius: 2, marginTop: 20 }} />
              </div>
            )
          })}
        </div>
      </Wrap>
    </section>
  )
}

// ─── WORKFLOW ────────────────────────────────────────────────
const STEPS = [
  { n: '01', color: '#6366f1', icon: '🏛', title: 'Admin sets up the school', desc: 'Creates departments, assigns HODs, manages faculty accounts, and verifies timetables once HODs submit them for approval.' },
  { n: '02', color: '#38bdf8', icon: '📋', title: 'HOD manages academics', desc: 'Defines course offerings per session, assigns faculty to subjects and batches, reviews result submissions, and publishes final results.' },
  { n: '03', color: '#34d399', icon: '🎓', title: 'Faculty && students work', desc: 'Faculty upload marks and add internal assessments. Students view real-time results, CGPA trends, timetables, and manage their academic profile.' },
]

function WorkflowSection() {
  return (
    <section id="workflow" style={{ padding: '96px 0', background: 'rgba(22,27,39,.25)' }}>
      <Wrap>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="rv"><SectionTag>Workflow</SectionTag></div>
          <h2 className="rv d1" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.5rem)', color: '#f1f5f9', letterSpacing: '-.02em', lineHeight: 1.15 }}>
            Up and running in three steps
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} className={`rv d${i + 1}`}>
              <div style={{ background: 'rgba(15,17,23,.85)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '30px 26px', height: '100%' }}>
                {/* Step number + icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: `${s.color}16`, border: `1px solid ${s.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '1.8rem', color: `${s.color}28`, lineHeight: 1 }}>{s.n}</span>
                </div>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: '.875rem', color: '#64748b', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  )
}

// ─── ROLES ───────────────────────────────────────────────────
const ROLES = [
  {
    id: 'student', label: 'Student', color: '#38bdf8', icon: '🎓',
    tagline: 'Your entire academic life, organised.',
    items: [
      'View published results and CGPA trend chart',

      'Access your weekly timetable with classroom details',
      'Submit reappear applications with reasons',
      'Build your profile — skills, projects, internships',
    ],
  },
  {
    id: 'faculty', label: 'Faculty', color: '#34d399', icon: '📖',
    tagline: 'Everything you need to teach and assess.',
    items: [

      'Upload marks — only for your assigned subjects and batches',
      'Add internal assessments: quiz, midterm, lab, viva',
      'View your complete weekly teaching timetable',
      'Post announcements to your department',
    ],
  },
  {
    id: 'hod', label: 'HOD', color: '#818cf8', icon: '🏛',
    tagline: 'Complete control over your department.',
    items: [
      'Create sessions and manage course offerings',
      'Assign faculty to subjects, semesters, and batches',
      'Track result submission progress in real time',
      'Review, freeze, and publish semester results',
      'Build timetables and submit to admin for approval',
    ],
  },
  {
    id: 'admin', label: 'Admin', color: '#fbbf24', icon: '⚙️',
    tagline: 'School-wide oversight, simplified.',
    items: [
      'Create departments and assign Heads of Department',
      'Verify and approve timetables from all departments',
      'Monitor departments and faculty across the school',
      'Manage school-wide settings and configuration',
      'Review full audit logs for all auth events',
    ],
  },
]

function RolesSection() {
  const [active, setActive] = useState('student')
  const role = ROLES.find(r => r.id === active)

  return (
    <section id="roles" style={{ padding: '96px 0' }}>
      <Wrap>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="rv"><SectionTag>Role Portals</SectionTag></div>
          <h2 className="rv d1" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.5rem)', color: '#f1f5f9', letterSpacing: '-.02em', lineHeight: 1.15 }}>
            One platform, four experiences
          </h2>
        </div>

        {/* Role tabs */}
        <div className="rv" style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
          {ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => setActive(r.id)}
              style={{
                padding: '8px 20px',
                borderRadius: 99,
                border: `1px solid ${active === r.id ? r.color + '55' : 'rgba(255,255,255,.08)'}`,
                background: active === r.id ? `${r.color}15` : 'transparent',
                color: active === r.id ? r.color : '#64748b',
                fontSize: '.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                transition: 'all .18s',
              }}
            >
              <span>{r.icon}</span>{r.label}
            </button>
          ))}
        </div>

        {/* Role detail card */}
        <div
          className="rv"
          style={{
            background: 'rgba(22,27,39,.7)',
            border: `1px solid ${role.color}28`,
            borderRadius: 20,
            padding: '40px 40px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40,
            alignItems: 'center',
          }}
        >
          {/* Left */}
          <div>
            <div style={{ width: 56, height: 56, borderRadius: 15, background: `${role.color}16`, border: `1px solid ${role.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 18 }}>
              {role.icon}
            </div>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#f1f5f9', marginBottom: 8 }}>
              {role.label} Portal
            </h3>
            <p style={{ fontSize: '.95rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: 28 }}>
              {role.tagline}
            </p>
            <Link
              to={role.id === 'student' ? ROUTES.REGISTER : ROUTES.LOGIN}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 9,
                background: `${role.color}18`,
                border: `1px solid ${role.color}45`,
                color: role.color,
                fontSize: '.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background .18s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${role.color}30`}
              onMouseLeave={e => e.currentTarget.style.background = `${role.color}18`}
            >
              {role.id === 'student' ? 'Create account' : 'Sign in'} →
            </Link>
          </div>

          {/* Right — feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {role.items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,.03)',
                  border: '1px solid rgba(255,255,255,.06)',
                  borderRadius: 10,
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${role.color}20`, border: `1px solid ${role.color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={role.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span style={{ fontSize: '.85rem', color: '#94a3b8', lineHeight: 1.55 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ padding: '72px 0 96px' }}>
      <Wrap>
        <div
          className="rv"
          style={{
            background: 'rgba(22,27,39,.8)',
            border: '1px solid rgba(99,102,241,.22)',
            borderRadius: 20,
            padding: '64px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle top glow */}
          <div aria-hidden style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 360, height: 200, background: 'radial-gradient(ellipse,rgba(99,102,241,.12) 0%,transparent 70%)', pointerEvents: 'none' }} />

          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: '#f1f5f9', letterSpacing: '-.02em', lineHeight: 1.15, marginBottom: 16, position: 'relative' }}>
            Ready to modernise your campus?
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.7, position: 'relative' }}>
            Start with Unicred today — students self-register, faculty and HODs are onboarded by your admin.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
            <Link
              to={ROUTES.REGISTER}
              style={{ padding: '13px 30px', borderRadius: 10, fontSize: '.95rem', fontWeight: 700, background: '#6366f1', color: '#fff', textDecoration: 'none', boxShadow: '0 0 24px rgba(99,102,241,.4)', transition: 'box-shadow .2s,transform .15s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 36px rgba(99,102,241,.6)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,.4)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Create student account
            </Link>
            <Link
              to={ROUTES.LOGIN}
              style={{ padding: '13px 30px', borderRadius: 10, fontSize: '.95rem', fontWeight: 600, color: '#94a3b8', textDecoration: 'none', border: '1px solid rgba(255,255,255,.1)', background: 'transparent', transition: 'border-color .15s,color .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.22)'; e.currentTarget.style.color = '#f1f5f9' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#94a3b8' }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </Wrap>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '36px 0' }}>
      <Wrap style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/unicred-logo.png" alt={APP_NAME} style={{ width: 26, height: 26, filter: 'drop-shadow(0 0 5px rgba(99,102,241,.4)) brightness(1.1)' }} />
          <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: '#f1f5f9', fontSize: '.9rem' }}>{APP_NAME}</span>
          <span style={{ fontSize: '.78rem', color: '#334155', marginLeft: 8 }}>© {new Date().getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['#features','Features'],['#workflow','Workflow'],['#roles','Roles']].map(([h, l]) => (
            <a key={l} href={h} style={{ fontSize: '.82rem', color: '#475569', textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}>{l}</a>
          ))}
        </div>
      </Wrap>
    </footer>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────
export default function Landing() {
  useCSS()
  useReveal()

  return (
    <div style={{ background: '#0f1117', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'Inter,system-ui,sans-serif' }}>
      <Nav />
      <Hero />
      <FeaturesSection />
      <WorkflowSection />
      <RolesSection />
      <CTASection />
      <Footer />
    </div>
  )
}
