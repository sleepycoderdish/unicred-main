// src/pages/hod/subjects/SubjectsPage.jsx
// HOD manages subjects (courses) and course offerings per session.
// Two tabs: Subjects (master list) | Offerings (per session).

import { useState } from 'react'
import { PageHeader }    from '@/components/ui/PageHeader'
import { Button }        from '@/components/ui/Button'
import { Input }         from '@/components/ui/Input'
import { Select }        from '@/components/ui/Select'
import { Modal }         from '@/components/ui/Modal'
import { Badge }         from '@/components/ui/Badge'
import { CardLoader }    from '@/components/ui/Loader'
import { useSubjects, useCreateSubject, useDeactivateSubject, useOfferings, useCreateOffering, useDeleteOffering } from '@/hooks/useSubjects'
import { useSessions }   from '@/hooks/useSessions'

const TYPE_OPTS   = [{ value: 'theory', label: 'Theory' }, { value: 'lab', label: 'Lab' }, { value: 'tutorial', label: 'Tutorial' }]
const TYPE_COLOR  = { theory: '#6366f1', lab: '#34d399', tutorial: '#fbbf24' }

// ── Create subject modal ──────────────────────────────────────
function CreateSubjectModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ courseCode: '', name: '', credits: '3', subjectType: 'theory', passingMarks: '40', totalMarks: '100' })
  const [errors, setErrors] = useState({})
  const { mutate: create, isPending } = useCreateSubject()

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.courseCode.trim()) errs.courseCode = 'Required'
    if (!form.name.trim())       errs.name = 'Required'
    setErrors(errs)
    if (Object.keys(errs).length) return

    create({
      courseCode:   form.courseCode.trim().toUpperCase(),
      name:         form.name.trim(),
      credits:      Number(form.credits),
      subjectType:  form.subjectType,
      passingMarks: Number(form.passingMarks),
      totalMarks:   Number(form.totalMarks),
    }, { onSuccess: () => { setForm({ courseCode:'',name:'',credits:'3',subjectType:'theory',passingMarks:'40',totalMarks:'100' }); onClose() }})
  }

  const f = (label, key, placeholder) => (
    <Input label={label} value={form[key]} placeholder={placeholder} error={errors[key]}
      onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })) }} required />
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Subject" maxWidth={460}>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {f('Course code', 'courseCode', 'e.g. EE301')}
          {f('Subject name', 'name', 'e.g. Digital Circuits')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Credits" value={form.credits} onChange={e => setForm(p => ({ ...p, credits: e.target.value }))} placeholder="3" />
            <Select label="Type" value={form.subjectType} onChange={e => setForm(p => ({ ...p, subjectType: e.target.value }))} options={TYPE_OPTS} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Passing marks" value={form.passingMarks} onChange={e => setForm(p => ({ ...p, passingMarks: e.target.value }))} placeholder="40" />
            <Input label="Total marks"   value={form.totalMarks}   onChange={e => setForm(p => ({ ...p, totalMarks:   e.target.value }))} placeholder="100" />
          </div>
        </div>
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending} loadingText="Creating...">Create</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

// ── Add offering modal ────────────────────────────────────────
function AddOfferingModal({ isOpen, onClose, sessionId }) {
  const [form, setForm] = useState({ subjectId: '', semesterNumber: '', batchYear: '' })
  const { data: subjects = [] } = useSubjects()
  const { mutate: create, isPending } = useCreateOffering()

  const subjectOpts = subjects.map(s => ({ value: String(s.id), label: `${s.courseCode} — ${s.name}` }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.subjectId || !form.semesterNumber || !form.batchYear) return
    create({
      sessionId:      Number(sessionId),
      subjectId:      Number(form.subjectId),
      semesterNumber: Number(form.semesterNumber),
      batchYear:      Number(form.batchYear),
    }, { onSuccess: () => { setForm({ subjectId:'',semesterNumber:'',batchYear:'' }); onClose() }})
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Course Offering" maxWidth={420}>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Subject" value={form.subjectId} onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))} options={subjectOpts} placeholder="Select subject" required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Semester" value={form.semesterNumber} onChange={e => setForm(p => ({ ...p, semesterNumber: e.target.value }))} placeholder="1–8" required />
            <Input label="Batch year" value={form.batchYear} onChange={e => setForm(p => ({ ...p, batchYear: e.target.value }))} placeholder="e.g. 2022" required />
          </div>
        </div>
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending} loadingText="Adding...">Add offering</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function SubjectsPage() {
  const [tab,          setTab]          = useState('subjects')
  const [createOpen,   setCreateOpen]   = useState(false)
  const [offerOpen,    setOfferOpen]    = useState(false)
  const [sessionFilter,setSessionFilter]= useState('')

  const { data: subjects  = [], isLoading: subLoading }                   = useSubjects()
  const { data: sessions  = [] }                                          = useSessions()
  const { data: offerings = [], isLoading: offLoading }                   = useOfferings(sessionFilter ? Number(sessionFilter) : null)
  const { mutate: deactivate, isPending: deactivating }                   = useDeactivateSubject()
  const { mutate: deleteOffer, isPending: deletingOffer }                 = useDeleteOffering()

  const sessionOpts = sessions.map(s => ({ value: String(s.id), label: s.name }))

  return (
    <div>
      <PageHeader title="Subjects"
        subtitle="Manage courses and define what is offered each session"
        action={
          tab === 'subjects'
            ? <Button variant="primary" onClick={() => setCreateOpen(true)}>+ New Subject</Button>
            : sessionFilter
              ? <Button variant="primary" onClick={() => setOfferOpen(true)}>+ Add Offering</Button>
              : null
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
        {['subjects', 'offerings'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 18px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize',
            color: tab === t ? 'var(--text-accent)' : 'var(--text-muted)',
            borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {/* ── Subjects tab ─────────────────────────────────── */}
      {tab === 'subjects' && (
        subLoading ? <div style={{ display:'flex',flexDirection:'column',gap:10 }}>{[1,2,3].map(i=><CardLoader key={i} lines={1}/>)}</div>
        : subjects.length === 0 ? (
          <div style={{ textAlign:'center',padding:'64px 20px',background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)' }}>
            <p style={{ color:'var(--text-muted)',marginBottom:12 }}>No subjects yet.</p>
            <Button variant="accent" size="sm" onClick={() => setCreateOpen(true)}>Create first subject</Button>
          </div>
        ) : (
          <div style={{ background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)',overflow:'hidden' }}>
            <div style={{ display:'grid',gridTemplateColumns:'80px 2fr 1fr 60px 80px 80px auto',gap:12,padding:'10px 18px',background:'var(--bg-elevated)',borderBottom:'1px solid var(--border-subtle)' }}>
              {['Code','Name','Type','Credits','Passing','Total',''].map(h=>(
                <span key={h} style={{ fontSize:'0.72rem',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em' }}>{h}</span>
              ))}
            </div>
            {subjects.map((s, idx) => (
              <div key={s.id} style={{ display:'grid',gridTemplateColumns:'80px 2fr 1fr 60px 80px 80px auto',gap:12,padding:'12px 18px',alignItems:'center',borderBottom:idx<subjects.length-1?'1px solid var(--border-subtle)':'none',transition:'background 0.12s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <span style={{ fontSize:'0.8rem',fontWeight:700,color:'var(--text-accent)',fontFamily:'var(--font-mono)' }}>{s.courseCode}</span>
                <p style={{ margin:0,fontWeight:600,fontSize:'0.875rem',color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.name}</p>
                <span style={{ fontSize:'0.72rem',fontWeight:600,textTransform:'capitalize',padding:'3px 10px',borderRadius:99,
                  background:`${TYPE_COLOR[s.subjectType]||'#6366f1'}15`,
                  border:`1px solid ${TYPE_COLOR[s.subjectType]||'#6366f1'}30`,
                  color:TYPE_COLOR[s.subjectType]||'#6366f1' }}>{s.subjectType}</span>
                <p style={{ margin:0,fontSize:'0.82rem',color:'var(--text-secondary)',textAlign:'center' }}>{s.credits}</p>
                <p style={{ margin:0,fontSize:'0.82rem',color:'var(--text-secondary)',textAlign:'center' }}>{s.passingMarks}</p>
                <p style={{ margin:0,fontSize:'0.82rem',color:'var(--text-secondary)',textAlign:'center' }}>{s.totalMarks}</p>
                <Button variant="ghost" size="sm" loading={deactivating} onClick={() => deactivate(s.id)}>Deactivate</Button>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Offerings tab ─────────────────────────────────── */}
      {tab === 'offerings' && (
        <div>
          <div style={{ marginBottom:16,maxWidth:280 }}>
            <Select label="Select session" value={sessionFilter} onChange={e=>setSessionFilter(e.target.value)}
              options={sessionOpts} placeholder="Choose a session" />
          </div>
          {!sessionFilter ? (
            <div style={{ textAlign:'center',padding:'48px 20px',background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)' }}>
              <p style={{ color:'var(--text-muted)' }}>Select a session to view its offerings.</p>
            </div>
          ) : offLoading ? (
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>{[1,2].map(i=><CardLoader key={i} lines={1}/>)}</div>
          ) : offerings.length === 0 ? (
            <div style={{ textAlign:'center',padding:'48px 20px',background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)' }}>
              <p style={{ color:'var(--text-muted)',marginBottom:12 }}>No offerings for this session yet.</p>
              <Button variant="accent" size="sm" onClick={() => setOfferOpen(true)}>Add first offering</Button>
            </div>
          ) : (
            <div style={{ background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)',overflow:'hidden' }}>
              <div style={{ display:'grid',gridTemplateColumns:'80px 2fr 80px 80px auto',gap:12,padding:'10px 18px',background:'var(--bg-elevated)',borderBottom:'1px solid var(--border-subtle)' }}>
                {['Code','Subject','Sem','Batch',''].map(h=><span key={h} style={{ fontSize:'0.72rem',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em' }}>{h}</span>)}
              </div>
              {offerings.map((o, i) => (
                <div key={o.id} style={{ display:'grid',gridTemplateColumns:'80px 2fr 80px 80px auto',gap:12,padding:'12px 18px',alignItems:'center',borderBottom:i<offerings.length-1?'1px solid var(--border-subtle)':'none',transition:'background 0.12s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <span style={{ fontSize:'0.8rem',fontWeight:700,color:'var(--text-accent)',fontFamily:'var(--font-mono)' }}>{o.subject?.courseCode}</span>
                  <p style={{ margin:0,fontWeight:600,fontSize:'0.875rem',color:'var(--text-primary)' }}>{o.subject?.name}</p>
                  <p style={{ margin:0,fontSize:'0.82rem',color:'var(--text-secondary)',textAlign:'center' }}>Sem {o.semesterNumber}</p>
                  <p style={{ margin:0,fontSize:'0.82rem',color:'var(--text-secondary)',textAlign:'center' }}>{o.batchYear}</p>
                  <Button variant="ghost" size="sm" loading={deletingOffer} onClick={() => deleteOffer(o.id)}>Remove</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <CreateSubjectModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <AddOfferingModal isOpen={offerOpen} onClose={() => setOfferOpen(false)} sessionId={sessionFilter} />
    </div>
  )
}
