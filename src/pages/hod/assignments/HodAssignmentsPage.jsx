// src/pages/hod/assignments/HodAssignmentsPage.jsx
// HOD assigns faculty members to offered courses per session/batch.
// A faculty can only submit marks for subjects they are assigned to.

import { useState } from 'react'
import { PageHeader }       from '@/components/ui/PageHeader'
import { Button }           from '@/components/ui/Button'
import { Select }           from '@/components/ui/Select'
import { Input }            from '@/components/ui/Input'
import { Modal }            from '@/components/ui/Modal'
import { Badge }            from '@/components/ui/Badge'
import { CardLoader }       from '@/components/ui/Loader'
import { useHodAssignments, useCreateHodAssignment, useDeleteHodAssignment } from '@/hooks/useHodAssignments'
import { useSessions }      from '@/hooks/useSessions'
import { useSubjects }      from '@/hooks/useSubjects'
import { useFaculties }     from '@/hooks/useFaculties'

function CreateAssignmentModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ sessionId:'', facultyId:'', subjectId:'', semesterNumber:'', batchYear:'' })
  const { data: sessions  = [] } = useSessions()
  const { data: subjects  = [] } = useSubjects()
  const { data: faculties = [] } = useFaculties()
  const { mutate: create, isPending } = useCreateHodAssignment()

  const sessionOpts  = sessions.filter(s=>['upcoming','active'].includes(s.status)).map(s=>({ value:String(s.id), label:s.name }))
  const subjectOpts  = subjects.map(s=>({ value:String(s.id), label:`${s.courseCode} — ${s.name}` }))
  const facultyOpts  = faculties.map(f=>({ value:String(f.userId), label:`${f.user.name} (${f.designation})` }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.sessionId||!form.facultyId||!form.subjectId||!form.semesterNumber||!form.batchYear) return
    create({
      sessionId:      Number(form.sessionId),
      facultyId:      Number(form.facultyId),
      subjectId:      Number(form.subjectId),
      semesterNumber: Number(form.semesterNumber),
      batchYear:      Number(form.batchYear),
    }, { onSuccess: () => { setForm({sessionId:'',facultyId:'',subjectId:'',semesterNumber:'',batchYear:''}); onClose() }})
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Faculty" maxWidth={460}>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <Select label="Session"    value={form.sessionId}      onChange={e=>setForm(p=>({...p,sessionId:e.target.value}))}      options={sessionOpts}  placeholder="Select session"  required />
          <Select label="Faculty"    value={form.facultyId}      onChange={e=>setForm(p=>({...p,facultyId:e.target.value}))}      options={facultyOpts}  placeholder="Select faculty"  required />
          <Select label="Subject"    value={form.subjectId}      onChange={e=>setForm(p=>({...p,subjectId:e.target.value}))}      options={subjectOpts}  placeholder="Select subject"  required />
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <Input label="Semester" value={form.semesterNumber} onChange={e=>setForm(p=>({...p,semesterNumber:e.target.value}))} placeholder="1–8"        required />
            <Input label="Batch"    value={form.batchYear}      onChange={e=>setForm(p=>({...p,batchYear:e.target.value}))}      placeholder="e.g. 2022"   required />
          </div>
        </div>
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending} loadingText="Assigning...">Assign</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default function HodAssignmentsPage() {
  const [createOpen,    setCreateOpen]    = useState(false)
  const [sessionFilter, setSessionFilter] = useState('')
  const { data: assignments = [], isLoading } = useHodAssignments()
  const { data: sessions    = [] }            = useSessions()
  const { mutate: remove, isPending: removing } = useDeleteHodAssignment()

  const sessionOpts = [
    { value: '', label: 'All sessions' },
    ...sessions.map(s => ({ value: String(s.id), label: s.name })),
  ]

  const filtered = sessionFilter
    ? assignments.filter(a => String(a.sessionId) === sessionFilter)
    : assignments

  return (
    <div>
      <PageHeader title="Faculty Assignments"
        subtitle="Assign faculty members to subjects for each session and batch"
        action={<Button variant="primary" onClick={() => setCreateOpen(true)}>+ Assign Faculty</Button>}
      />

      {/* Session filter */}
      <div style={{ marginBottom: 20, maxWidth: 280 }}>
        <Select label="Filter by session" value={sessionFilter}
          onChange={e => setSessionFilter(e.target.value)} options={sessionOpts} />
      </div>

      {isLoading ? (
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>{[1,2,3].map(i=><CardLoader key={i} lines={1}/>)}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center',padding:'64px 20px',background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)' }}>
          <p style={{ color:'var(--text-muted)',marginBottom:12 }}>No assignments{sessionFilter ? ' for this session' : ''} yet.</p>
          <Button variant="accent" size="sm" onClick={() => setCreateOpen(true)}>Create assignment</Button>
        </div>
      ) : (
        <div style={{ background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)',overflow:'hidden' }}>
          <div style={{ display:'grid',gridTemplateColumns:'2fr 2fr 1fr 80px 80px auto',gap:12,padding:'10px 18px',background:'var(--bg-elevated)',borderBottom:'1px solid var(--border-subtle)' }}>
            {['Faculty','Subject','Session','Sem','Batch',''].map(h=>(
              <span key={h} style={{ fontSize:'0.72rem',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em' }}>{h}</span>
            ))}
          </div>
          {filtered.map((a, idx) => (
            <div key={a.id} style={{ display:'grid',gridTemplateColumns:'2fr 2fr 1fr 80px 80px auto',gap:12,padding:'13px 18px',alignItems:'center',borderBottom:idx<filtered.length-1?'1px solid var(--border-subtle)':'none',transition:'background 0.12s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <div>
                <p style={{ margin:0,fontWeight:600,fontSize:'0.875rem',color:'var(--text-primary)' }}>{a.faculty?.user?.name}</p>
                <p style={{ margin:0,fontSize:'0.75rem',color:'var(--text-muted)' }}>{a.faculty?.user?.email}</p>
              </div>
              <div>
                <p style={{ margin:0,fontWeight:600,fontSize:'0.875rem',color:'var(--text-primary)' }}>{a.subject?.name}</p>
                <p style={{ margin:0,fontSize:'0.75rem',color:'var(--text-muted)',fontFamily:'var(--font-mono)' }}>{a.subject?.courseCode}</p>
              </div>
              <Badge type="status" value={a.session?.status} />
              <p style={{ margin:0,fontSize:'0.82rem',color:'var(--text-secondary)',textAlign:'center' }}>Sem {a.semesterNumber}</p>
              <p style={{ margin:0,fontSize:'0.82rem',color:'var(--text-secondary)',textAlign:'center' }}>{a.batchYear}</p>
              <Button variant="ghost" size="sm" loading={removing} onClick={() => remove(a.id)}>Remove</Button>
            </div>
          ))}
        </div>
      )}

      <CreateAssignmentModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
